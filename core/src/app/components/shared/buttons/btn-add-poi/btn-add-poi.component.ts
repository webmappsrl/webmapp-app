import {ChangeDetectionStrategy, Component, ViewEncapsulation, inject} from '@angular/core';
import {IonicModule, ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {setEnablePoiRecorderPanel} from '@wm-core/store/user-activity/user-activity.action';
import {loginIfNeeded} from 'src/app/functions/login-if-needed';

/**
 * Fab della mappa camminiditalia che apre la creazione di un POI (oc:8762), al posto del fab che
 * raggruppava traccia e POI: la traccia ora parte dal bottone «Inizia il tuo cammino». Se l'utente
 * non è loggato apre prima il login e, se il login riesce, apre il pannello senza un secondo tocco.
 */
@Component({
  selector: 'webmapp-btn-add-poi',
  templateUrl: './btn-add-poi.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule],
})
export class BtnAddPoiComponent {
  private _store = inject(Store);
  private _modalCtrl = inject(ModalController);

  /**
   * Apre il pannello di creazione del POI, passando dal login se serve.
   *
   * @returns una promise che si risolve quando il flusso è concluso.
   */
  async start(): Promise<void> {
    if (await loginIfNeeded(this._store, this._modalCtrl)) {
      this._store.dispatch(setEnablePoiRecorderPanel({enable: true}));
    }
  }
}
