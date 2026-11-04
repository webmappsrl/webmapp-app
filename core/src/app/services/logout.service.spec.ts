import {TestBed} from '@angular/core/testing';
import {AlertController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {LangService} from '@wm-core/localization/lang.service';
import {loadSignOuts} from '@wm-core/store/auth/auth.actions';
import {DiaryOutboxService} from '@wm-core/diaries/diary-outbox.service';
import {LogoutService} from './logout.service';

describe('LogoutService (oc:8169)', () => {
  let svc: LogoutService;
  let dispatch: jasmine.Spy;
  let pending: number;
  let lastAlert: any;
  let chosen: 'cancel' | 'confirm';

  beforeEach(() => {
    TestBed.resetTestingModule();
    pending = 0;
    chosen = 'confirm';
    dispatch = jasmine.createSpy('dispatch');
    const alertCtrl = {
      create: jasmine.createSpy('create').and.callFake(async (opts: any) => {
        lastAlert = opts;
        return {
          present: async () => {
            const button = opts.buttons[chosen === 'confirm' ? 1 : 0];
            button.handler?.();
          },
          onDidDismiss: async () => ({role: chosen === 'confirm' ? undefined : 'cancel'}),
        };
      }),
    };
    TestBed.configureTestingModule({
      providers: [
        {provide: AlertController, useValue: alertCtrl},
        {provide: Store, useValue: {dispatch}},
        {provide: LangService, useValue: {instant: (key: string, p?: any) => (p ? `${key}|${p.n}` : key)}},
        {provide: DiaryOutboxService, useValue: {pendingCountForCurrentUser: async () => pending}},
      ],
    });
    svc = TestBed.inject(LogoutService);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('senza diari in coda il messaggio è quello di sempre', async () => {
    await svc.confirmLogout();

    expect(lastAlert.message).toBe('modals.settings.alert.logout');
  });

  it('con diari in coda aggiunge l\'avviso', async () => {
    pending = 2;

    await svc.confirmLogout();

    expect(lastAlert.message).toContain('Hai {{n}} diari in attesa di invio');
    expect(lastAlert.message).toContain('|2');
  });

  it('conferma: esce e restituisce true', async () => {
    const result = await svc.confirmLogout();

    expect(dispatch).toHaveBeenCalledWith(loadSignOuts());
    expect(result).toBeTrue();
  });

  it('annulla: non esce e restituisce false', async () => {
    chosen = 'cancel';

    const result = await svc.confirmLogout();

    expect(dispatch).not.toHaveBeenCalled();
    expect(result).toBeFalse();
  });
});
