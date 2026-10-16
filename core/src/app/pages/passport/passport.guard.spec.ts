import {TestBed} from '@angular/core/testing';
import {Router, UrlTree} from '@angular/router';
import {Store} from '@ngrx/store';
import {BehaviorSubject, firstValueFrom, isObservable, Observable, of} from 'rxjs';
import {confAUTHEnable, isConfLoaded} from '@wm-core/store/conf/conf.selector';
import {selectAuthState} from '@wm-core/store/auth/auth.selectors';
import {passportGuard} from './passport.guard';

describe('passportGuard (oc:8703)', () => {
  /**
   * Esegue la guardia con config, autenticazione e login dati.
   *
   * @param authEnable Autenticazione attiva nella config.
   * @param logged Utente loggato.
   * @param confLoaded Config già caricata.
   * @returns L'esito della guardia.
   */
  async function run(
    authEnable: boolean,
    logged: boolean,
    confLoaded = true,
  ): Promise<boolean | UrlTree> {
    TestBed.resetTestingModule();
    const store = {
      select: (sel: unknown) =>
        of(
          sel === confAUTHEnable
            ? authEnable
            : sel === isConfLoaded
            ? confLoaded
            : sel === selectAuthState
            ? {isLogged: logged}
            : null,
        ),
    };
    TestBed.configureTestingModule({providers: [{provide: Store, useValue: store}]});
    const result = TestBed.runInInjectionContext(() => passportGuard({} as any, {} as any));
    return isObservable(result)
      ? firstValueFrom(result as Observable<boolean | UrlTree>)
      : (result as any);
  }

  beforeEach(() => localStorage.setItem('access_token', 'tok'));

  afterEach(() => {
    localStorage.removeItem('access_token');
    TestBed.resetTestingModule();
  });

  it('utente loggato con autenticazione attiva: entra', async () => {
    expect(await run(true, true)).toBeTrue();
  });

  it('utente non loggato: va alla Home', async () => {
    // un utente uscito non ha più il token: ogni logout lo cancella
    localStorage.removeItem('access_token');
    const result = await run(true, false);
    const router = TestBed.inject(Router);

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/home');
  });

  it('ricaricando la pagina da loggato aspetta il login invece di mandare alla Home', async () => {
    const auth$ = new BehaviorSubject<any>({isLogged: false});
    TestBed.resetTestingModule();
    const store = {
      select: (sel: unknown) =>
        sel === selectAuthState ? auth$ : of(sel === confAUTHEnable || sel === isConfLoaded),
    };
    TestBed.configureTestingModule({providers: [{provide: Store, useValue: store}]});
    const result = firstValueFrom(
      TestBed.runInInjectionContext(() => passportGuard({} as any, {} as any)) as Observable<
        boolean | UrlTree
      >,
    );
    auth$.next({isLogged: true});

    expect(await result).toBeTrue();
  });

  it('autenticazione spenta: va alla Home', async () => {
    expect((await run(false, true)) instanceof UrlTree).toBeTrue();
  });
});
