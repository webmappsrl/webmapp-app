import {ChangeDetectionStrategy, Component, ViewEncapsulation, inject} from '@angular/core';
import {IonicModule, ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {setEnableTrackRecorderPanel} from '@wm-core/store/user-activity/user-activity.action';
import {minimizeOpenMapDetails} from 'src/app/functions/minimize-open-map-details';
import {loginIfNeeded} from 'src/app/functions/login-if-needed';

/**
 * Bottone «Inizia il tuo cammino» della mappa camminiditalia (oc:8762): avvia subito la
 * registrazione della traccia, senza lo «scorri per registrare» del recorder. Se l'utente non è
 * loggato apre prima il login e, se il login riesce, avvia la registrazione senza un secondo tocco.
 */
@Component({
  selector: 'webmapp-btn-start-walk',
  templateUrl: './btn-start-walk.component.html',
  styleUrls: ['./btn-start-walk.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, WmPipeModule],
})
export class BtnStartWalkComponent {
  private _store = inject(Store);
  private _modalCtrl = inject(ModalController);
  private _geolocationSvc = inject(GeolocationService);

  /**
   * Avvia la registrazione, passando dal login se serve.
   *
   * @returns una promise che si risolve quando il flusso è concluso.
   */
  async start(): Promise<void> {
    if (await loginIfNeeded(this._store, this._modalCtrl)) {
      this._startRecording();
    }
  }

  /**
   * Avvia la registrazione con la parte di `recordStart()` del recorder che tocca GPS e store
   * (`startRecording()` e il pannello di dettaglio ridotto al titolo se è aperto), poi apre il
   * pannello di registrazione. Il resto di `recordStart()` (`isPaused`, timer) lo fa il recorder
   * stesso: montandosi con `onRecord` già vero, `checkRecording()` in `ngOnInit` fa partire il tempo
   * e lo slider non compare. Per questo `startRecording()` va per primo.
   */
  private _startRecording(): void {
    this._geolocationSvc.startRecording();
    minimizeOpenMapDetails(this._store);
    this._store.dispatch(setEnableTrackRecorderPanel({enable: true}));
  }
}
