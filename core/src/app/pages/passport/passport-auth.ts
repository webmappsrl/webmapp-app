import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {selectAuthState} from '@wm-core/store/auth/auth.selectors';

/**
 * Login dell'utente, solo quando è noto (oc:8703). All'avvio `isLogged` vale `false` finché
 * `me()` non risponde, e un utente loggato che ricarica la pagina sul tab Passaporto verrebbe
 * scambiato per uno uscito. Il login è noto quando l'utente risulta loggato oppure quando non c'è
 * più un `access_token`: ogni logout, il fallimento di `me()` e la cancellazione dell'account lo
 * tolgono. Si osserva lo stato intero e non `isLogged`, che non riemette quando sparisce solo il
 * token.
 *
 * @param store Store NgRx.
 * @returns Observable che emette `true`/`false` solo a login noto, senza ripetizioni.
 */
export function resolvedLogin$(store: Store): Observable<boolean> {
  return store.select(selectAuthState).pipe(
    map(state => state?.isLogged === true),
    filter(logged => logged || !localStorage.getItem('access_token')),
    distinctUntilChanged(),
  );
}
