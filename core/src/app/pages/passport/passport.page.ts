import {ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {PassportService} from '@wm-core/passport/passport.service';
import {resolvedLogin$} from './passport-auth';

/**
 * Pagina del tab Passaporto di camminiditalia (oc:8703): ospita il passaporto a timbri di
 * `wm-core`. Al rientro nel tab rilegge `/api/passport`; al logout, anche per token scaduto
 * (`logoutByError$`, che non naviga), torna alla Home.
 *
 * Ionic tiene in memoria le pagine dei tab quando si cambia tab: `ngOnInit` non riparte a ogni
 * ingresso. Per questo il login si ascolta solo mentre la pagina è visibile, da
 * `ionViewWillEnter` a `ionViewWillLeave`: un logout fatto dal Profilo non deve portare l'utente
 * via da lì.
 */
@Component({
  standalone: false,
  selector: 'webmapp-page-passport',
  templateUrl: './passport.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PassportPage implements OnDestroy {
  /** La prima entrata non rilegge: i dati arrivano già con la sottoscrizione del componente. */
  private _entered = false;
  private _loggedSub: Subscription = Subscription.EMPTY;

  constructor(
    private _store: Store,
    private _passportSvc: PassportService,
    private _router: Router,
  ) {}

  /**
   * Ionic chiama questo hook a ogni ingresso nel tab: dal secondo si rilegge l'elenco, e da qui
   * a `ionViewWillLeave` un logout riporta alla Home.
   */
  ionViewWillEnter(): void {
    if (this._entered) this._passportSvc.refreshPassport();
    this._entered = true;
    this._loggedSub.unsubscribe();
    this._loggedSub = resolvedLogin$(this._store)
      .pipe(filter(logged => !logged))
      .subscribe(() => void this._router.navigate(['/home']));
  }

  /** Uscendo dal tab smette di ascoltare il login. */
  ionViewWillLeave(): void {
    this._loggedSub.unsubscribe();
  }

  /** Alla distruzione della pagina smette di ascoltare il login. */
  ngOnDestroy(): void {
    this._loggedSub.unsubscribe();
  }
}
