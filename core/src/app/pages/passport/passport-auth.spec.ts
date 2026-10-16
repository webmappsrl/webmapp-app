import {BehaviorSubject} from 'rxjs';
import {selectAuthState} from '@wm-core/store/auth/auth.selectors';
import {resolvedLogin$} from './passport-auth';

describe('resolvedLogin$ (oc:8703)', () => {
  let auth$: BehaviorSubject<any>;
  const store = {select: (sel: unknown) => (sel === selectAuthState ? auth$ : null)} as any;

  beforeEach(() => {
    auth$ = new BehaviorSubject<any>({isLogged: false});
    localStorage.removeItem('access_token');
  });

  afterEach(() => localStorage.removeItem('access_token'));

  it("con un token salvato aspetta la risposta di me(): niente false all'avvio", () => {
    localStorage.setItem('access_token', 'tok');
    const seen: boolean[] = [];
    const sub = resolvedLogin$(store).subscribe(v => seen.push(v));

    expect(seen).toEqual([]);
    auth$.next({isLogged: true});
    expect(seen).toEqual([true]);
    sub.unsubscribe();
  });

  it("senza token l'utente non è loggato", () => {
    const seen: boolean[] = [];
    const sub = resolvedLogin$(store).subscribe(v => seen.push(v));

    expect(seen).toEqual([false]);
    sub.unsubscribe();
  });

  it("me() fallito: il token sparisce e l'utente risulta non loggato", () => {
    localStorage.setItem('access_token', 'tok');
    const seen: boolean[] = [];
    const sub = resolvedLogin$(store).subscribe(v => seen.push(v));
    localStorage.removeItem('access_token');
    auth$.next({isLogged: false, error: {status: 401}});

    expect(seen).toEqual([false]);
    sub.unsubscribe();
  });

  it('logout dopo il login: emette false', () => {
    localStorage.setItem('access_token', 'tok');
    const seen: boolean[] = [];
    const sub = resolvedLogin$(store).subscribe(v => seen.push(v));
    auth$.next({isLogged: true});
    localStorage.removeItem('access_token');
    auth$.next({isLogged: false});

    expect(seen).toEqual([true, false]);
    sub.unsubscribe();
  });
});
