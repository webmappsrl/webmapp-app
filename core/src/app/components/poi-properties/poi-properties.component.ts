import {Component, ChangeDetectionStrategy, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'wm-poi-properties',
  templateUrl: './poi-properties.component.html',
  styleUrls: ['./poi-properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoiPropertiesComponent {
  @Input() properties;
  constructor() {}
}
