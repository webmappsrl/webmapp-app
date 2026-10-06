import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Inject, Injectable, Optional} from '@angular/core';
import {Share} from '@capacitor/share';
import {LangService} from '@wm-core/localization/lang.service';
import {EnvironmentService} from '@wm-core/services/environment.service';
import {WmShareImageResponse, WmShareImageService} from '@wm-core/services/share-image.service';
import {POSTHOG_CLIENT} from '@wm-core/store/conf/conf.token';
import {UgcTrackShareResult} from '@wm-core/ugc-track-properties/ugc-track-properties.component';
import {WmFeature} from '@wm-types/feature';
import {WmPosthogClient} from '@wm-types/posthog';
import {Feature, LineString} from 'geojson';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

export interface ShareObject {
  dialogTitle?: string;
  id?: number;
  text?: string;
  title?: string;
  url?: string;
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
    private _shareImageSvc: WmShareImageService,
    @Optional() @Inject(POSTHOG_CLIENT) private _posthogClient?: WmPosthogClient,
  ) {
    this._baseLink = this._environmentSvc.shareLink;

    // `url` non è un testo da tradurre: resta il default `www.webmapp.it` (oc:8702).
    this._translate
      .get(['Hai visto questo percorso?', 'Condividi con i tuoi amici'])
      .subscribe(t => {
        this.defaultShareObj.title = t['Hai visto questo percorso?'];
        this.defaultShareObj.dialogTitle = t['Condividi con i tuoi amici'];
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
   * Condivide una traccia UGC registrata «come storia» (oc:8183, terza revisione semplificata): il
   * backend fa tutto il lavoro (statistiche, mappa, composizione, salvataggio per la pagina
   * pubblica) a partire dal solo `uuid` della traccia — niente screenshot, niente statistiche lato
   * client, niente `app_id`. Questo metodo tiene la guardia «in corso», il controllo sull'`uuid`,
   * PostHog e i messaggi d'errore, e delega la condivisione vera e propria a
   * `WmShareImageService.shareNative()` di wm-core (oc:8702), che:
   * 1. esegue la richiesta `POST /api/share-story-image` costruita qui con `{uuid}`;
   * 2. scarica l'`image_url` restituito in un file della cache (`@capacitor/filesystem`);
   * 3. passa quel file e lo `share_url` pubblico restituito al generico `Share.share()`
   *    (`@capacitor/share`) — nessun plugin nativo Instagram/Facebook.
   *
   * Non lancia mai: risolve sempre un `UgcTrackShareResult`, che il chiamante (`map.page.ts`)
   * restituisce all'input `[shareResult]` di `<wm-ugc-track-properties>`. Nessun retry
   * automatico: in caso di errore l'utente riprova con il pulsante «Riprova» già gestito da
   * wm-core, che riemette lo stesso evento `share-track` e richiama questo metodo da capo.
   *
   * @param track La feature completa della traccia UGC registrata, come emessa da
   * `(share-track)`. Si usa solo `track.properties.uuid`.
   * @returns L'esito da restituire tramite `[shareResult]`.
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

      await this._shareImageSvc.shareNative(
        this._requestShareImage(uuid),
        {
          text: this.defaultShareObj.text,
          title: this.defaultShareObj.title,
          dialogTitle: this.defaultShareObj.dialogTitle,
        },
        `webmapp-story-${Date.now()}.png`,
      );

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
   * Costruisce la richiesta `POST /api/share-story-image` con il solo `{uuid}`. La richiesta è
   * fredda: la esegue `WmShareImageService.shareNative()`. Gli errori HTTP si traducono qui in un
   * `Error` con un messaggio leggibile, come prima dello spostamento in wm-core.
   *
   * @param uuid `track.properties.uuid` della traccia UGC da condividere.
   * @returns La richiesta che emette l'URL dell'immagine composta e quello della pagina pubblica.
   */
  private _requestShareImage(uuid: string): Observable<WmShareImageResponse> {
    return this._http
      .post<WmShareImageResponse>(`${this._environmentSvc.origin}/api/share-story-image`, {uuid})
      .pipe(
        catchError(error => throwError(() => new Error(this._extractBackendErrorMessage(error)))),
      );
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
   * Messaggio d'errore leggibile, in italiano, per `UgcTrackShareResult.errorMessage`, ricavato
   * al meglio dall'errore ricevuto. Sono stringhe scritte nel codice, non chiavi di traduzione:
   * a differenza di `title` e `dialogTitle` di `defaultShareObj`, che da oc:8702 si traducono con
   * le chiavi italiane di wm-core. Per un errore senza messaggio restituisce `undefined`, e vale il
   * messaggio generico tradotto di wm-core (`'Condivisione non riuscita'`).
   *
   * @param error Quanto è stato lanciato o rifiutato lungo il flusso.
   * @returns Il messaggio da mostrare all'utente, o `undefined` per usare quello generico di
   * wm-core.
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
