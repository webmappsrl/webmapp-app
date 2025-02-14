import {Component, ChangeDetectionStrategy, Input, ViewEncapsulation} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'wm-poi-properties',
  templateUrl: './poi-properties.component.html',
  styleUrls: ['./poi-properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoiPropertiesComponent {
  private _properties;

  @Input()
  set properties(value) {
    this._properties = value;
    this.showTechnicalDetails$.next(value?.ele || value?.address);
    this.showUsefulUrls$.next(value?.contact_phone || value?.contact_email || value?.related_url);
  }

  get properties() {
    return this._properties;
  }

  showTechnicalDetails$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showUsefulUrls$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  tracks;
}
