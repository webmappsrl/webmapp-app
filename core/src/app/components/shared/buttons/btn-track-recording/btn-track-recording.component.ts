import {ModalController} from '@ionic/angular';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

import {Store} from '@ngrx/store';
import {
  setEnablePoiRecorderPanel,
  setEnableTrackRecorderPanel,
} from '@wm-core/store/user-activity/user-activity.action';
import {loginIfNeeded} from 'src/app/functions/login-if-needed';

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
  @Output('start-recording') startRecording: EventEmitter<string> = new EventEmitter<string>();

  constructor(private _store: Store, private _modalController: ModalController) {}

  /**
   * Apre il pannello di registrazione della traccia, passando dal login se serve: se il login
   * riesce il pannello si apre senza un secondo tocco (oc:8762).
   *
   * @returns una promise che si risolve quando il flusso è concluso.
   */
  async track(): Promise<void> {
    if (await loginIfNeeded(this._store, this._modalController)) {
      this._store.dispatch(setEnableTrackRecorderPanel({enable: true}));
    }
  }

  /**
   * Apre il pannello di creazione del POI, passando dal login se serve (oc:8762).
   *
   * @returns una promise che si risolve quando il flusso è concluso.
   */
  async waypoint(): Promise<void> {
    if (await loginIfNeeded(this._store, this._modalController)) {
      this._store.dispatch(setEnablePoiRecorderPanel({enable: true}));
    }
  }
}
