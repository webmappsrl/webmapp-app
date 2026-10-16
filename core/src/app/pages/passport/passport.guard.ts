import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {Store} from '@ngrx/store';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {confAUTHEnable, isConfLoaded} from '@wm-core/store/conf/conf.selector';
import {resolvedLogin$} from './passport-auth';

/**
 * Guardia del tab Passaporto (oc:8703): entra solo l'utente loggato, con l'autenticazione attiva
 * nella config, come per la voce della tab bar. Copre l'apertura della rotta da URL nella PWA;
 * il logout mentre si è sul tab lo gestisce la pagina. Aspetta che la config sia caricata e che il
 * login sia noto: ricaricando la pagina da loggato non si finisce in Home.
 *
 * @returns `true`, oppure il ritorno alla Home.
 */
export const passportGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const store = inject(Store);
  const router = inject(Router);
  return combineLatest([
    store.select(isConfLoaded),
    store.select(confAUTHEnable),
    resolvedLogin$(store),
  ]).pipe(
    filter(([confLoaded]) => confLoaded),
    take(1),
    map(([, authEnable, logged]) => (authEnable && logged ? true : router.parseUrl('/home'))),
  );
};
