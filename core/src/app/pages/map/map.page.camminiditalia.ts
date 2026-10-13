import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MapPageBase} from './map.page.base';

/**
 * Pagina mappa di camminiditalia (oc:8762): stessa logica e stesso template di `MapPageBase` e
 * della pagina di default, con `showStartWalk` acceso (bottone «Inizia il tuo cammino» e fab del
 * solo POI) e un foglio di stile in più. Sostituisce `map.page.ts` via `fileReplacements` nella
 * configuration `camminiditalia`; non importa mai `map.page.ts`, che punterebbe a se stesso.
 */
@Component({
  standalone: false,
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss', './map.page.camminiditalia.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapPage extends MapPageBase {
  override readonly showStartWalk = true;
}
