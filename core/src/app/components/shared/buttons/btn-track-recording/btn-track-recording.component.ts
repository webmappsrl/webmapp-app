import {ModalController} from '@ionic/angular';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import {LoginComponent} from '@wm-core/login/login.component';
import {Store} from '@ngrx/store';
import {
  setEnablePoiRecorderPanel,
  setEnableTrackRecorderPanel,
} from '@wm-core/store/user-activity/user-activity.action';

@Component({
  selector: 'wm-btn-track-recording',
  templateUrl: './btn-track-recording.component.html',
  styleUrls: ['./btn-track-recording.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class BtnTrackRecordingComponent {
  @Input() currentTrack: any;
  @Input() isLogged = false;
  @Output('start-recording') startRecording: EventEmitter<string> = new EventEmitter<string>();

  constructor(private _store: Store, private _modalController: ModalController) {}

  openModalLogin(): void {
    this._modalController
      .create({
        component: LoginComponent,
        canDismiss: true,
        mode: 'ios',
        id: 'webmapp-login-modal',
      })
      .then(modal => {
        modal.present();
        modal.onWillDismiss().then(res => {
          this.isLogged = res.data as boolean;
        });
      });
  }

  track(): void {
    if (this.isLogged) {
      this._store.dispatch(setEnableTrackRecorderPanel({enable: true}));
    } else {
      this.openModalLogin();
    }
  }

  waypoint(): void {
    if (this.isLogged) {
      this._store.dispatch(setEnablePoiRecorderPanel({enable: true}));
    } else {
      this.openModalLogin();
    }
  }
}
