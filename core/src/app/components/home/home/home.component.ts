import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {NavController} from '@ionic/angular';

import {DeviceService} from 'src/app/services/base/device.service';
import { IHOME,ILAYER } from 'wm-core/types/config';

@Component({
  selector: 'wm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  @Input() conf: IHOME[];
  @Output() filterClickEvt: EventEmitter<string> = new EventEmitter();
  @Output() openSlugEvt: EventEmitter<string> = new EventEmitter();
  @Output() selectedLayerEvt: EventEmitter<ILAYER | null | number> = new EventEmitter();
  @Output() selectedTrackEvt: EventEmitter<string | number> = new EventEmitter();

  constructor(public deviceService: DeviceService, private _navCtrl: NavController) {}

  openMap(): void {
    this._navCtrl.navigateForward('map');
  }

  openSlug(slug: string): void {
    this.openSlugEvt.emit(slug);
  }

  selectLayer(layer: ILAYER | null | number): void {
    this.selectedLayerEvt.emit(layer);
  }

  selectTrack(id: string | number): void {
    this.selectedTrackEvt.emit(id);
  }
}
