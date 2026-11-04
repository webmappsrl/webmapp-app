import {ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {AuthService} from '@wm-core/store/auth/auth.service';
import {WmProfileDeleteButtonComponent} from '@wm-core/shared/profile-delete-button/profile-delete-button.component';
import {LogoutService} from 'src/app/services/logout.service';

/**
 * Tab «Account» del profilo, solo camminiditalia (oc:8169): download, consenso dati, uscita ed
 * eliminazione dell'account come voci di elenco, nel flusso della pagina. Da non loggato solo i
 * download. Dichiarato in `ProfileAccountTabModule`, importato solo dal routing di
 * camminiditalia: questo file non importa `WmCoreModule`, che sotto Karma non si carica.
 */
@Component({
  standalone: false,
  selector: 'webmapp-profile-account-tab',
  templateUrl: './profile-account-tab.component.html',
  styleUrls: ['./profile-account-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProfileAccountTabComponent {
  private _logoutSvc = inject(LogoutService);
  private _authSvc = inject(AuthService);

  /** Componente nascosto di wm-core: tiene l'alert di eliminazione con la conferma scritta. */
  @ViewChild(WmProfileDeleteButtonComponent) private _deleteBtn?: WmProfileDeleteButtonComponent;

  readonly isLogged$: Observable<boolean> = inject(Store).select(isLogged);

  /** Apre l'alert di wm-core per modificare il consenso dati. */
  editPrivacy(): void {
    this._authSvc.showPrivacyAgreeAlert().subscribe();
  }

  /** Esce dall'account dopo la conferma. */
  logout(): void {
    void this._logoutSvc.confirmLogout();
  }

  /** Chiede l'eliminazione dell'account con l'alert di wm-core. */
  deleteAccount(): void {
    this._deleteBtn?.deleteUserAlert();
  }
}
