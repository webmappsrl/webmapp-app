import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {LoginComponent} from '@wm-core/login/login.component';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {firstValueFrom} from 'rxjs';

/**
 * Garantisce un utente loggato prima di un'azione (oc:8762): se non lo è apre la modale di login e
 * ne attende la chiusura.
 *
 * `LoginComponent` chiude la modale senza dati sia dopo un login riuscito sia con la X, quindi
 * l'esito si legge dallo store alla chiusura, non da `onDidDismiss().data`.
 *
 * @param store lo store NgRx da cui leggere lo stato di login.
 * @param modalCtrl il controller con cui aprire la modale di login.
 * @returns true se alla fine l'utente è loggato.
 */
export async function loginIfNeeded(store: Store, modalCtrl: ModalController): Promise<boolean> {
  if (await firstValueFrom(store.select(isLogged))) {
    return true;
  }
  const modal = await modalCtrl.create({
    component: LoginComponent,
    canDismiss: true,
    mode: 'ios',
    id: 'webmapp-login-modal',
  });
  await modal.present();
  await modal.onDidDismiss();
  return firstValueFrom(store.select(isLogged));
}
