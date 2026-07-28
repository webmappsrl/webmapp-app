import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {LayerFavoriteService} from '@wm-core/services/layer-favorite.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {ILAYER, ILAYERBOX} from '@wm-core/types/config';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Mostra la lista dei cammini (layer) preferiti dell'utente nel tab "Cammini"
 * della pagina Preferiti, riusando `LayerFavoriteService` e `wm-layer-box`.
 */
@Component({
  standalone: false,
  selector: 'webmapp-favourites-layers',
  templateUrl: './favourites-layers.component.html',
  styleUrls: ['./favourites-layers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesLayersComponent implements OnInit {
  layers$: Observable<ILAYER[]> = this._layerFavoriteSvc.favorites$;
  layerBoxes$: Observable<ILAYERBOX[]> = this.layers$.pipe(
    map(layers => layers.map(layer => ({box_type: 'layer' as const, title: layer.title, layer}))),
  );
  loadError = false;
  loading = true;

  /**
   * @param _layerFavoriteSvc Servizio per la gestione dei layer (cammini) preferiti.
   * @param _urlHandlerSvc Naviga alla mappa con il layer selezionato al tap sulla card,
   * stesso comportamento del click su un box layer dalla Home.
   * @param _cdr Riferimento al change detector, necessario con `OnPush` per marcare
   * esplicitamente la vista da ricontrollare quando lo stato muta fuori da un Observable.
   */
  constructor(
    private _layerFavoriteSvc: LayerFavoriteService,
    private _urlHandlerSvc: UrlHandlerService,
    private _cdr: ChangeDetectorRef,
  ) {}

  openLayer(layer: ILAYER): void {
    this._urlHandlerSvc.setLayer(layer);
  }

  /**
   * `trackBy` per `*ngFor`: `layerBoxes$` rimappa ogni layer in un nuovo oggetto
   * letterale ad ogni emissione di `favorites$` (es. dopo un toggle), quindi senza
   * `trackBy` Angular distruggerebbe e ricreerebbe tutte le card ad ogni singola
   * variazione di preferito invece di quella toccata soltanto.
   */
  trackByLayerId(_index: number, box: ILAYERBOX): string {
    return box.layer.id;
  }

  /**
   * Carica la lista dei layer preferiti al mount del componente, esponendo
   * `loadError` in caso di fallimento.
   */
  async ngOnInit(): Promise<void> {
    try {
      await this._layerFavoriteSvc.getFavorites();
      this.loadError = false;
    } catch {
      this.loadError = true;
    } finally {
      this.loading = false;
      this._cdr.markForCheck();
    }
  }
}
