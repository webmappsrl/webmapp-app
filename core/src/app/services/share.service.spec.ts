import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {FilesystemWeb} from '@capacitor/filesystem/dist/esm/web';
import {ShareWeb} from '@capacitor/share/dist/esm/web';
import {TestBed} from '@angular/core/testing';
import {LangService} from '@wm-core/localization/lang.service';
import {EnvironmentService} from '@wm-core/services/environment.service';
import {POSTHOG_CLIENT} from '@wm-core/store/conf/conf.token';
import {of, throwError, Subject} from 'rxjs';
import {ShareService} from './share.service';

describe('ShareService (oc:8702, caratterizzazione)', () => {
  const ORIGIN = 'http://127.0.0.1:8000';
  const SHARE_LINK = 'app.sub.webmapp.it';
  const TRANSLATIONS = {
    'Hai visto questo percorso?': 'Titolo tradotto',
    'Condividi con i tuoi amici': 'Dialogo tradotto',
  };
  const RESPONSE = {image_url: 'https://img/story.png', share_url: 'https://share/ugc-track/abc'};
  const track = (uuid?: string) => ({properties: uuid == null ? {} : {uuid}}) as any;

  let http: {post: jasmine.Spy};
  let posthog: {capture: jasmine.Spy};
  let shareSpy: jasmine.Spy;
  let downloadSpy: jasmine.Spy;
  let getUriSpy: jasmine.Spy;
  let service: ShareService;

  beforeEach(() => {
    http = {post: jasmine.createSpy('post').and.returnValue(of(RESPONSE))};
    posthog = {capture: jasmine.createSpy('capture')};
    // `Share` e `Filesystem` sono Proxy di Capacitor che ricreano il wrapper a ogni accesso:
    // spyOn sul proxy non regge. Si stubbano invece le implementazioni web (in Karma la
    // piattaforma è `web`), che il proxy risolve a ogni chiamata.
    shareSpy = spyOn(ShareWeb.prototype, 'share').and.resolveTo({} as any);
    getUriSpy = spyOn(FilesystemWeb.prototype, 'getUri').and.resolveTo({
      uri: 'file:///cache/story.png',
    });
    // `downloadFile` è una proprietà di istanza (arrow nel costruttore), non sul prototype:
    // un accessor sul prototype intercetta l'assegnazione del costruttore e serve lo spy.
    downloadSpy = jasmine.createSpy('downloadFile').and.resolveTo({});
    Object.defineProperty(FilesystemWeb.prototype, 'downloadFile', {
      configurable: true,
      get: () => downloadSpy,
      set: () => {},
    });
    spyOn(console, 'error');

    const lang = {get: () => of(TRANSLATIONS)} as any;
    const env = {origin: ORIGIN, shareLink: SHARE_LINK} as any;
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {provide: LangService, useValue: lang},
        {provide: EnvironmentService, useValue: env},
        {provide: HttpClient, useValue: http},
        {provide: POSTHOG_CLIENT, useValue: posthog},
      ],
    });
    // `WmShareImageService` è `providedIn: 'root'`: TestBed inietta l'istanza reale.
    service = TestBed.inject(ShareService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    delete (FilesystemWeb.prototype as any).downloadFile;
  });

  describe('shareTrackToStories', () => {
    it('senza uuid restituisce errore e non fa nessuna POST', async () => {
      const res = await service.shareTrackToStories(track());

      expect(res).toEqual({
        success: false,
        errorMessage: 'Impossibile condividere: percorso non ancora sincronizzato.',
      });
      expect(http.post).not.toHaveBeenCalled();
    });

    it('una seconda chiamata mentre la prima è in corso viene rifiutata', async () => {
      const pending = new Subject<typeof RESPONSE>();
      http.post.and.returnValue(pending);

      const first = service.shareTrackToStories(track('abc'));
      const second = await service.shareTrackToStories(track('abc'));

      expect(second).toEqual({success: false, errorMessage: 'Una condivisione è già in corso.'});

      pending.next(RESPONSE);
      pending.complete();
      expect(await first).toEqual({success: true});
    });

    it("il controllo 'in corso' precede quello sull'uuid e il flag si libera a fine chiamata", async () => {
      const pending = new Subject<typeof RESPONSE>();
      http.post.and.returnValue(pending);

      const first = service.shareTrackToStories(track('abc'));
      const second = await service.shareTrackToStories(track());

      expect(second).toEqual({success: false, errorMessage: 'Una condivisione è già in corso.'});
      expect(http.post).toHaveBeenCalledTimes(1);

      pending.next(RESPONSE);
      pending.complete();
      await first;
      http.post.and.returnValue(of(RESPONSE));

      expect(await service.shareTrackToStories(track('abc'))).toEqual({success: true});
    });

    it('in caso di successo posta {uuid}, condivide url e file e traccia contentShared', async () => {
      const res = await service.shareTrackToStories(track('abc'));

      expect(http.post).toHaveBeenCalledOnceWith(`${ORIGIN}/api/share-story-image`, {uuid: 'abc'});
      expect(downloadSpy).toHaveBeenCalledTimes(1);
      expect(downloadSpy.calls.mostRecent().args[0].url).toBe(RESPONSE.image_url);
      expect(getUriSpy).toHaveBeenCalledTimes(1);
      expect(shareSpy).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          url: RESPONSE.share_url,
          files: ['file:///cache/story.png'],
          title: TRANSLATIONS['Hai visto questo percorso?'],
          dialogTitle: TRANSLATIONS['Condividi con i tuoi amici'],
        }),
      );
      expect(posthog.capture).toHaveBeenCalledOnceWith('contentShared', {
        content_type: 'track-story',
        content_id: 'abc',
      });
      expect(res).toEqual({success: true});
    });

    it('dopo un errore la condivisione successiva riparte pulita', async () => {
      http.post.and.returnValue(throwError(() => new HttpErrorResponse({status: 404})));
      await service.shareTrackToStories(track('abc'));
      http.post.and.returnValue(of(RESPONSE));

      expect(await service.shareTrackToStories(track('abc'))).toEqual({success: true});
    });

    [
      [404, 'Percorso non trovato: la condivisione potrebbe essere scaduta.'],
      [403, 'Non sei autorizzato a condividere questo percorso.'],
      [422, 'I dati per la condivisione non sono validi.'],
    ].forEach(([status, message]) => {
      it(`errore HTTP ${status} produce il messaggio dedicato`, async () => {
        http.post.and.returnValue(throwError(() => new HttpErrorResponse({status: status as number})));

        const res = await service.shareTrackToStories(track('abc'));

        expect(res).toEqual({success: false, errorMessage: message as string});
        expect(shareSpy).not.toHaveBeenCalled();
        expect(posthog.capture).not.toHaveBeenCalled();
      });
    });

    it("preferisce il messaggio `error` del backend a quello di default", async () => {
      http.post.and.returnValue(
        throwError(() => new HttpErrorResponse({status: 422, error: {error: 'Messaggio backend'}})),
      );

      const res = await service.shareTrackToStories(track('abc'));

      expect(res.errorMessage).toBe('Messaggio backend');
    });

    it("Share.share rifiutata con 'Share canceled' restituisce 'Condivisione annullata.'", async () => {
      shareSpy.and.rejectWith(new Error('Share canceled'));

      const res = await service.shareTrackToStories(track('abc'));

      expect(res).toEqual({success: false, errorMessage: 'Condivisione annullata.'});
      expect(posthog.capture).not.toHaveBeenCalled();
    });
  });

  describe('sharePoiByID', () => {
    it('condivide il link del POI sulla mappa', async () => {
      service.sharePoiByID(5);
      // sharePoiByID è fire-and-forget e il proxy carica l'implementazione in modo asincrono
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(shareSpy).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({url: `https://${SHARE_LINK}/map?poi=5`}),
      );
      expect(posthog.capture).toHaveBeenCalledWith('contentShared', {
        content_type: 'poi',
        content_id: '5',
      });
    });
  });
});
