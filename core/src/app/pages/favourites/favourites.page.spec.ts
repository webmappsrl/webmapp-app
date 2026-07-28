import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {GeohubService} from 'src/app/services/geohub.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

import {FavouritesPage} from './favourites.page';

describe('FavouritesPage — segmento Tracce/Cammini (oc:8176)', () => {
  function createPage(showFavorites: boolean): FavouritesPage {
    const storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'pipe']);
    storeSpy.select.and.returnValue(of(showFavorites));
    storeSpy.pipe.and.returnValue(of(false));
    const geoHubSvcSpy = jasmine.createSpyObj<GeohubService>('GeohubService', [
      'getFavouriteTracks',
      'setFavouriteTrack',
    ]);
    geoHubSvcSpy.getFavouriteTracks.and.resolveTo([]);
    const urlHandlerSvcSpy = jasmine.createSpyObj<UrlHandlerService>('UrlHandlerService', [
      'changeURL',
    ]);

    return new FavouritesPage(geoHubSvcSpy, storeSpy, urlHandlerSvcSpy);
  }

  it('parte con il segmento "tracks" selezionato', () => {
    const page = createPage(true);
    expect(page.selectedSegment).toBe('tracks');
  });

  it('espone showLayersSegment$ come true quando showFavorites è true', done => {
    const page = createPage(true);
    page.showLayersSegment$.subscribe(v => {
      expect(v).toBe(true);
      done();
    });
  });

  it('espone showLayersSegment$ come false quando showFavorites è false', done => {
    const page = createPage(false);
    page.showLayersSegment$.subscribe(v => {
      expect(v).toBe(false);
      done();
    });
  });
});
