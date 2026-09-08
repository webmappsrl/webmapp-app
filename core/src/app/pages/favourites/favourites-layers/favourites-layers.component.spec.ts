import {ChangeDetectorRef} from '@angular/core';
import {LayerFavoriteService} from '@wm-core/services/layer-favorite.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {ILAYER} from '@wm-core/types/config';
import {of} from 'rxjs';

import {FavouritesLayersComponent} from './favourites-layers.component';

describe('FavouritesLayersComponent (oc:8176)', () => {
  const fakeLayer: ILAYER = {id: '3', title: 'Cammino preferito'} as any;

  let urlHandlerSvcSpy: jasmine.SpyObj<UrlHandlerService>;

  function createComponent(
    favorites: ILAYER[],
    getFavoritesError = false,
  ): {component: FavouritesLayersComponent; cdrSpy: jasmine.SpyObj<ChangeDetectorRef>} {
    const favoriteSvcSpy = jasmine.createSpyObj<LayerFavoriteService>('LayerFavoriteService', [
      'getFavorites',
    ]);
    (favoriteSvcSpy as any).favorites$ = of(favorites);
    if (getFavoritesError) {
      favoriteSvcSpy.getFavorites.and.rejectWith(new Error('network error'));
    } else {
      favoriteSvcSpy.getFavorites.and.resolveTo(favorites);
    }
    urlHandlerSvcSpy = jasmine.createSpyObj<UrlHandlerService>('UrlHandlerService', ['setLayer']);
    const cdrSpy = jasmine.createSpyObj<ChangeDetectorRef>('ChangeDetectorRef', ['markForCheck']);

    return {
      component: new FavouritesLayersComponent(favoriteSvcSpy, urlHandlerSvcSpy, cdrSpy),
      cdrSpy,
    };
  }

  it('espone loadError = true se getFavorites fallisce', async () => {
    const {component} = createComponent([], true);
    await component.ngOnInit();
    expect(component.loadError).toBeTrue();
  });

  it('espone loadError = false e la lista se getFavorites va a buon fine', async () => {
    const {component} = createComponent([fakeLayer]);
    await component.ngOnInit();
    expect(component.loadError).toBeFalse();

    let layers: ILAYER[];
    component.layers$.subscribe(v => (layers = v));
    expect(layers).toEqual([fakeLayer]);
  });

  it('avvolge ogni layer in un box di tipo layer per wm-layer-box', async () => {
    const {component} = createComponent([fakeLayer]);
    await component.ngOnInit();

    let boxes: any[];
    component.layerBoxes$.subscribe(v => (boxes = v));
    expect(boxes).toEqual([{box_type: 'layer', title: fakeLayer.title, layer: fakeLayer}]);
  });

  it('chiama markForCheck() sul ChangeDetectorRef quando getFavorites fallisce (OnPush)', async () => {
    const {component, cdrSpy} = createComponent([], true);
    await component.ngOnInit();

    expect(component.loadError).toBeTrue();
    expect(cdrSpy.markForCheck).toHaveBeenCalled();
  });

  it('openLayer() naviga alla mappa con il layer selezionato, come dalla Home', () => {
    const {component} = createComponent([fakeLayer]);

    component.openLayer(fakeLayer);

    expect(urlHandlerSvcSpy.setLayer).toHaveBeenCalledWith(fakeLayer);
  });
});
