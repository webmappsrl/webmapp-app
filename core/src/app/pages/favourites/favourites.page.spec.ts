import {Store} from '@ngrx/store';
import {BehaviorSubject, of} from 'rxjs';
import {GeohubService} from 'src/app/services/geohub.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

import {FavouritesPage} from './favourites.page';

describe('FavouritesPage — segmento Layers/Sentieri (oc:8176, oc:8465)', () => {
  function createPage(
    showFavorites: BehaviorSubject<boolean> | boolean,
  ): {page: FavouritesPage; showFavorites$: BehaviorSubject<boolean>} {
    const showFavorites$ =
      showFavorites instanceof BehaviorSubject ? showFavorites : new BehaviorSubject(showFavorites);
    const storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'pipe']);
    storeSpy.select.and.returnValue(showFavorites$);
    storeSpy.pipe.and.returnValue(of(false));
    const geoHubSvcSpy = jasmine.createSpyObj<GeohubService>('GeohubService', [
      'getFavouriteTracks',
      'setFavouriteTrack',
    ]);
    geoHubSvcSpy.getFavouriteTracks.and.resolveTo([]);
    const urlHandlerSvcSpy = jasmine.createSpyObj<UrlHandlerService>('UrlHandlerService', [
      'changeURL',
    ]);

    return {
      page: new FavouritesPage(geoHubSvcSpy, storeSpy, urlHandlerSvcSpy),
      showFavorites$,
    };
  }

  it('parte con il segmento "layers" quando showFavorites è true', async () => {
    const {page} = createPage(true);
    await page.ngOnInit();
    expect(page.selectedSegment).toBe('layers');
  });

  it('parte con il segmento "tracks" quando showFavorites è false', async () => {
    const {page} = createPage(false);
    await page.ngOnInit();
    expect(page.selectedSegment).toBe('tracks');
  });

  it('risolve "layers" anche se la config arriva in due emissioni (cache stale poi fresca) — oc:8465', async () => {
    const {page, showFavorites$} = createPage(false);
    await page.ngOnInit();
    expect(page.selectedSegment).toBe('tracks');

    showFavorites$.next(true);
    expect(page.selectedSegment).toBe('layers');
  });

  it("non sovrascrive la scelta manuale dell'utente quando la config arriva dopo", async () => {
    const {page, showFavorites$} = createPage(false);
    await page.ngOnInit();

    page.onSegmentChange('tracks');
    showFavorites$.next(true);

    expect(page.selectedSegment).toBe('tracks');
  });

  it('torna a "tracks" se il flag passa da true a false (evita un vicolo cieco senza switch)', async () => {
    const {page, showFavorites$} = createPage(true);
    await page.ngOnInit();
    expect(page.selectedSegment).toBe('layers');

    showFavorites$.next(false);
    expect(page.selectedSegment).toBe('tracks');
  });

  it('espone showLayersSegment$ come true quando showFavorites è true', done => {
    const {page} = createPage(true);
    page.showLayersSegment$.subscribe(v => {
      expect(v).toBe(true);
      done();
    });
  });

  it('espone showLayersSegment$ come false quando showFavorites è false', done => {
    const {page} = createPage(false);
    page.showLayersSegment$.subscribe(v => {
      expect(v).toBe(false);
      done();
    });
  });
});
