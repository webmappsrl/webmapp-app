import {Injectable, inject} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {LangService} from '@wm-core/localization/lang.service';
import {loadSignOuts} from '@wm-core/store/auth/auth.actions';
import {DiaryOutboxService} from '@wm-core/diaries/diary-outbox.service';

/**
 * Conferma di uscita dall'account, in un punto solo (oc:8169): la usano l'ingranaggio delle
 * impostazioni e la tab «Account» del profilo camminiditalia. Con diari in coda l'avviso dice
 * che partiranno al prossimo accesso.
 */
@Injectable({providedIn: 'root'})
export class LogoutService {
  private _alertCtrl = inject(AlertController);
  private _store = inject(Store);
  private _langSvc = inject(LangService);
  private _diaryOutbox = inject(DiaryOutboxService);

  /**
   * Chiede conferma ed esce.
   *
   * @returns `true` se l'utente ha confermato e l'uscita è partita.
   */
  async confirmLogout(): Promise<boolean> {
    const queued = await this._diaryOutbox.pendingCountForCurrentUser().catch(() => 0);
    const base = this._langSvc.instant('modals.settings.alert.logout');
    const message =
      queued > 0
        ? `${base} ${this._langSvc.instant(
            'Hai {{n}} diari in attesa di invio: se esci, partiranno al tuo prossimo accesso',
            {n: queued},
          )}`
        : base;
    let confirmed = false;
    try {
      const alert = await this._alertCtrl.create({
        mode: 'ios',
        header: this._langSvc.instant('generic.warning'),
        message,
        buttons: [
          {text: this._langSvc.instant('generic.cancel'), role: 'cancel'},
          {
            text: this._langSvc.instant('generic.confirm'),
            handler: () => {
              confirmed = true;
              this._store.dispatch(loadSignOuts());
            },
          },
        ],
      });
      await alert.present();
      await alert.onDidDismiss();
    } catch (error) {
      console.warn(error);
    }
    return confirmed;
  }
}
