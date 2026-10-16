import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {MapPageBase} from './map.page.base';

/**
 * Pagina mappa di default. La logica sta in `MapPageBase` (oc:8762); la variante camminiditalia
 * (`map.page.camminiditalia.ts`) la sostituisce via `fileReplacements` con un altro template.
 */
@Component({
  standalone: false,
  selector: 'webmapp-map-page',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapPage extends MapPageBase {}
