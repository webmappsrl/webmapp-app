import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Inject, Injectable, Optional} from '@angular/core';
import {Directory, Filesystem} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';
import {LangService} from '@wm-core/localization/lang.service';
import {EnvironmentService} from '@wm-core/services/environment.service';
import {POSTHOG_CLIENT} from '@wm-core/store/conf/conf.token';
import {UgcTrackShareResult} from '@wm-core/ugc-track-properties/ugc-track-properties.component';
import {WmFeature} from '@wm-types/feature';
import {WmPosthogClient} from '@wm-types/posthog';
import {Feature, LineString} from 'geojson';
import {firstValueFrom} from 'rxjs';

export interface ShareObject {
  dialogTitle?: string;
  id?: number;
  text?: string;
  title?: string;
  url?: string;
}

/**
 * @description
 * Response shape of `POST /api/share-story-image` (oc:8183, simplified third revision) —
 * confirmed against the real `wm-package` implementation (`ShareStoryImageController`): plain
 * JSON with two URLs, not a base64 image. `image_url` points to the composited image persisted
 * by the backend (Spatie media, needed for the public share page to serve it later);
 * `share_url` is the public `GET /share/ugc-track/{uuid}` page (Open Graph tags) to hand to
 * `Share.share({url: ...})` for channels that unfurl links (WhatsApp, Messenger, etc.).
 */
interface ShareStoryImageResponse {
  image_url: string;
  share_url: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private _baseLink;
  private _host;
  private defaultShareObj: ShareObject = {
    title: 'See cool stuff',
    text: '',
    url: 'www.webmapp.it',
    dialogTitle: 'Share with buddies',
  };

  /**
   * Guards against overlapping calls to `shareTrackToStories()` (defense-in-depth: the primary
   * double-tap guard already lives in wm-core's `UgcTrackPropertiesComponent.triggerShare()`, see
   * that component's notes.md). Reset in a `finally` block so a failed attempt never blocks a
   * subsequent clean retry — every invocation starts from scratch with no residual state.
   */
  private _shareStoryInFlight = false;

  constructor(
    private _translate: LangService,
    private _environmentSvc: EnvironmentService,
    private _http: HttpClient,
    @Optional() @Inject(POSTHOG_CLIENT) private _posthogClient?: WmPosthogClient,
  ) {
    this._baseLink = this._environmentSvc.shareLink;

    this._translate
      .get(['services.share.title', 'services.share.url', 'services.share.dialogTitle'])
      .subscribe(t => {
        this.defaultShareObj.title = t['services.share.title'];
        this.defaultShareObj.url = t['services.share.url'];
        this.defaultShareObj.dialogTitle = t['services.share.dialogTitle'];
      });
  }

  /**
   *
   * Share something with the app sharing system
   * @param shareObj Info about wht to share
   */
  public async share(shareObj: ShareObject) {
    const so = Object.assign(this.defaultShareObj, shareObj);
    let shareRet = await Share.share(so);
    console.log(
      '------- ~ file: share.service.ts ~ line 20 ~ ShareService ~ share ~ shareRet',
      shareRet,
    );
  }

  public sharePoiByID(poiId: number): void {
    this._posthogClient?.capture('contentShared', {
      content_type: 'poi',
      content_id: `${poiId}`,
    });
    this.share({
      url: `https://${this._baseLink}/map?poi=${poiId}`,
    });
  }

  public async shareRoute(route: Feature<LineString>): Promise<void> {
    this._posthogClient?.capture('contentShared', {
      content_type: 'track',
      content_id: `${route.properties.id}`,
    });
    return this.share({
      url: `${this._environmentSvc.origin}/track/${route.properties.id}`,
    });
  }

  public shareTrackByID(trackId: number): void {
    this._posthogClient?.capture('contentShared', {
      content_type: 'track',
      content_id: `${trackId}`,
    });
    this.share({
      url: `https://${this._baseLink}/map?track=${trackId}`,
    });
  }

  /**
   * @description
   * Shares a recorded UGC track "as a Story" (oc:8183, simplified third revision): the backend
   * does all the work (stats, map rendering, compositing, persistence for the public page) from
   * just the track's `uuid` — no screenshot, no client-side stats, no `app_id`. This method:
   * 1. calls `POST /api/share-story-image` with `{uuid}`;
   * 2. downloads the returned `image_url` to a local cache file (`@capacitor/filesystem`);
   * 3. hands that file + the returned public `share_url` to the generic `Share.share()`
   *    (`@capacitor/share`) — no native Instagram/Facebook plugin involved anymore.
   *
   * Never throws — always resolves a `UgcTrackShareResult`, which the caller (`map.page.ts`) feeds
   * back into `<wm-ugc-track-properties>`'s `[shareResult]` input. No automatic retry: on failure
   * the user retries explicitly via the "Riprova" button already handled by wm-core, which simply
   * re-emits the same `share-track` event and calls this method again from scratch.
   *
   * @param track The full recorded UGC track feature, as emitted by `(share-track)`. Only
   * `track.properties.uuid` is used.
   * @returns The outcome to feed back via `[shareResult]`.
   */
  public async shareTrackToStories(track: WmFeature<LineString>): Promise<UgcTrackShareResult> {
    if (this._shareStoryInFlight) {
      return {
        success: false,
        errorMessage: 'Una condivisione è già in corso.',
      };
    }
    this._shareStoryInFlight = true;

    try {
      const uuid = track.properties?.uuid;
      if (uuid == null) {
        return {
          success: false,
          errorMessage: 'Impossibile condividere: percorso non ancora sincronizzato.',
        };
      }

      const {image_url, share_url} = await this._requestShareImage(uuid);
      const fileUri = await this._downloadImageToCache(image_url);

      await Share.share({
        url: share_url,
        files: [fileUri],
        text: this.defaultShareObj.text,
        title: this.defaultShareObj.title,
        dialogTitle: this.defaultShareObj.dialogTitle,
      });

      this._posthogClient?.capture('contentShared', {
        content_type: 'track-story',
        content_id: `${uuid}`,
      });

      return {success: true};
    } catch (error) {
      console.error('[ShareService] shareTrackToStories failed', error);
      return {success: false, errorMessage: this._resolveErrorMessage(error)};
    } finally {
      this._shareStoryInFlight = false;
    }
  }

  /**
   * @description
   * Calls `POST /api/share-story-image` with only `{uuid}` and returns the parsed JSON response.
   *
   * @param uuid `track.properties.uuid` of the UGC track being shared.
   * @returns The composited image URL and public share URL returned by the backend.
   */
  private async _requestShareImage(uuid: string): Promise<ShareStoryImageResponse> {
    try {
      return await firstValueFrom(
        this._http.post<ShareStoryImageResponse>(
          `${this._environmentSvc.origin}/api/share-story-image`,
          {uuid},
        ),
      );
    } catch (error) {
      throw new Error(this._extractBackendErrorMessage(error));
    }
  }

  /**
   * @description
   * Downloads the composited image from the backend's `image_url` straight to a local cache
   * file via `Filesystem.downloadFile()` (native download, no manual base64 round-trip), so it
   * can be passed to `Share.share({files: [...]})`. `downloadFile()` returns a `path`, not a
   * ready-to-use `uri` — `Filesystem.getUri()` resolves the same `path`+`directory` pair to the
   * full `file://`-style URI `Share.share()` expects (same two-call pattern Capacitor's own docs
   * use for this).
   *
   * @param imageUrl The `image_url` returned by `POST /api/share-story-image`.
   * @returns The local file `uri` to hand to `Share.share()`.
   */
  private async _downloadImageToCache(imageUrl: string): Promise<string> {
    const fileName = `webmapp-story-${Date.now()}.png`;
    await Filesystem.downloadFile({
      url: imageUrl,
      path: fileName,
      directory: Directory.Cache,
    });
    const {uri} = await Filesystem.getUri({path: fileName, directory: Directory.Cache});
    return uri;
  }

  /**
   * @description
   * Raw English strings `@capacitor/share`'s native layer rejects with — identical wording on
   * both iOS (`ios/Sources/SharePlugin/SharePlugin.swift`) and Android
   * (`android/.../SharePlugin.java`), verified directly against the installed plugin source
   * rather than guessed. Anything not in this map (e.g. an arbitrary Android
   * `Exception.getLocalizedMessage()`) falls through to `undefined`, letting wm-core's own
   * generic fallback (`'Condivisione non riuscita'`) take over instead of leaking English/raw
   * text to the user.
   */
  private static readonly NATIVE_SHARE_ERROR_TRANSLATIONS: Record<string, string> = {
    'Share canceled': 'Condivisione annullata.',
    "Can't share while sharing is in progress": 'Una condivisione è già in corso.',
    'Error sharing item': 'Errore durante la condivisione.',
    'Must provide at least url, text or files': 'Impossibile avviare la condivisione.',
    'Must provide a URL or Message or files': 'Impossibile avviare la condivisione.',
    'Unsupported url': 'Formato non supportato per la condivisione.',
    'only file urls are supported': 'Formato non supportato per la condivisione.',
  };

  /**
   * @description
   * Best-effort, human-readable (Italian) error message for `UgcTrackShareResult.errorMessage`.
   * Hardcoded strings, not translation keys — consistent with this same file's pre-existing
   * `defaultShareObj` (`'See cool stuff'`, `'Share with buddies'`), which are likewise plain
   * literals rather than i18n lookups. Falls back to `undefined` for unrecognized errors, letting
   * wm-core's own generic translated fallback message (`'Condivisione non riuscita'`) take over.
   *
   * @param error Whatever was thrown/rejected along the flow.
   * @returns A message to show the user, or `undefined` to use wm-core's generic fallback.
   */
  private _resolveErrorMessage(error: unknown): string | undefined {
    if (error instanceof Error && error.message) {
      return (
        ShareService.NATIVE_SHARE_ERROR_TRANSLATIONS[error.message] ?? error.message
      );
    }
    return undefined;
  }

  /**
   * @description
   * Extracts a usable error message from an `HttpErrorResponse` for `POST /api/share-story-image`.
   * Unlike the previous (screenshot-upload) revision, the request here is plain JSON in both
   * directions, so `HttpClient` already parses the error body for us — no manual Blob reading
   * needed. Field name assumed to be `error` (matching the existing, still-committed backend
   * controller's validation/error responses, e.g. `{'error' => ..., 'code' => 422}` — see
   * notes.md); adjust here if the real simplified endpoint uses a different key.
   *
   * @param error Whatever `HttpClient.post()` rejected with.
   * @returns A best-effort human-readable message.
   */
  private _extractBackendErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = (error.error as {error?: string} | null)?.error;
      switch (error.status) {
        case 404:
          return backendMessage ?? 'Percorso non trovato: la condivisione potrebbe essere scaduta.';
        case 403:
          return backendMessage ?? 'Non sei autorizzato a condividere questo percorso.';
        case 422:
          return backendMessage ?? 'I dati per la condivisione non sono validi.';
        case 0:
          return 'Nessuna connessione di rete disponibile.';
        default:
          return backendMessage ?? "Errore del server durante la generazione dell'immagine.";
      }
    }
    return 'Errore di rete durante la condivisione.';
  }
}
