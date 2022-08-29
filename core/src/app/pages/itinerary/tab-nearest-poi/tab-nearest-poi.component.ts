import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'webmapp-tab-nearest-poi',
  templateUrl: './tab-nearest-poi.component.html',
  styleUrls: ['./tab-nearest-poi.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabNearestPoiComponent {
  @Input() nearestPoi: any | null;
}
