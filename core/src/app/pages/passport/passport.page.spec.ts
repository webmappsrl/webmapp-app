import {BehaviorSubject} from 'rxjs';
import {PassportPage} from './passport.page';

describe('PassportPage (oc:8703)', () => {
  let logged$: BehaviorSubject<any>;
  let refreshPassport: jasmine.Spy;
  let navigate: jasmine.Spy;
  let page: PassportPage;

  beforeEach(() => {
    localStorage.setItem('access_token', 'tok');
    logged$ = new BehaviorSubject<any>({isLogged: true});
    refreshPassport = jasmine.createSpy('refreshPassport');
    navigate = jasmine.createSpy('navigate').and.resolveTo(true);
    page = new PassportPage(
      {select: () => logged$} as any,
      {refreshPassport} as any,
      {navigate} as any,
    );
  });

  afterEach(() => {
    page.ngOnDestroy();
    localStorage.removeItem('access_token');
  });

  /** Logout: il token sparisce e lo stato dice non loggato. */
  const logout = () => {
    localStorage.removeItem('access_token');
    logged$.next({isLogged: false});
  };
  /** Login: token salvato e stato loggato. */
  const login = () => {
    localStorage.setItem('access_token', 'tok');
    logged$.next({isLogged: true});
  };

  it('al logout sul tab, anche per token scaduto, torna alla Home', () => {
    page.ionViewWillEnter();
    expect(navigate).not.toHaveBeenCalled();

    logout();

    expect(navigate).toHaveBeenCalledOnceWith(['/home']);
  });

  it("un logout fatto da un altro tab non porta via l'utente", () => {
    page.ionViewWillEnter();
    page.ionViewWillLeave();

    logout();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('Ionic riusa la pagina: al secondo ciclo login/logout torna di nuovo alla Home', () => {
    page.ionViewWillEnter();
    logout();
    page.ionViewWillLeave();
    login();
    page.ionViewWillEnter();
    logout();

    expect(navigate).toHaveBeenCalledTimes(2);
  });

  it('ricaricando da loggato non manda alla Home mentre il login si ripristina', () => {
    logged$.next({isLogged: false});
    page.ionViewWillEnter();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('il primo ingresso non rilegge, i successivi sì', () => {
    page.ionViewWillEnter();
    expect(refreshPassport).not.toHaveBeenCalled();

    page.ionViewWillLeave();
    page.ionViewWillEnter();
    expect(refreshPassport).toHaveBeenCalledTimes(1);
  });
});
