import {TestBed, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {LoginComponent} from '@wm-core/login/login.component';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {
  setEnableTrackRecorderPanel,
  setMapDetailsStatus,
} from '@wm-core/store/user-activity/user-activity.action';
import {mapDetailsStatus as MapDetailsStatus} from '@wm-core/store/user-activity/user-activity.reducer';
import {BehaviorSubject, of} from 'rxjs';

import {BtnStartWalkComponent} from './btn-start-walk.component';

describe('BtnStartWalkComponent (oc:8762)', () => {
  let isLogged$: BehaviorSubject<boolean>;
  let detailsStatus: MapDetailsStatus;
  let storeSpy: jasmine.SpyObj<Store>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let geolocationSpy: jasmine.SpyObj<GeolocationService>;
  let resolveDismiss: () => void;
  let component: BtnStartWalkComponent;

  beforeEach(() => {
    isLogged$ = new BehaviorSubject<boolean>(false);
    storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    detailsStatus = 'open';
    storeSpy.select.and.callFake(((selector: unknown) => {
      // L'unico altro selettore letto è lo stato del pannello, in `minimizeOpenMapDetails()`.
      return selector === isLogged ? isLogged$.asObservable() : of(detailsStatus);
    }) as any);

    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.present.and.resolveTo();
    modalSpy.onDidDismiss.and.returnValue(
      new Promise(resolve => (resolveDismiss = () => resolve({data: undefined, role: undefined}))),
    );
    modalCtrlSpy = jasmine.createSpyObj<ModalController>('ModalController', ['create']);
    modalCtrlSpy.create.and.resolveTo(modalSpy);

    geolocationSpy = jasmine.createSpyObj<GeolocationService>('GeolocationService', [
      'startRecording',
    ]);

    TestBed.configureTestingModule({
      providers: [
        {provide: Store, useValue: storeSpy},
        {provide: ModalController, useValue: modalCtrlSpy},
        {provide: GeolocationService, useValue: geolocationSpy},
      ],
    });
    component = TestBed.runInInjectionContext(() => new BtnStartWalkComponent());
  });

  /**
   * La registrazione parte subito, senza lo «scorri per registrare» del recorder: prima
   * `startRecording()`, così il pannello si monta con `onRecord` già vero, poi il dettaglio aperto
   * ridotto al solo titolo come fa `recordStart()`, infine l'apertura del pannello.
   */
  function expectRecordingStarted(): void {
    expect(geolocationSpy.startRecording).toHaveBeenCalledTimes(1);
    expect(storeSpy.dispatch.calls.allArgs()).toEqual([
      [setMapDetailsStatus({status: 'onlyTitle'})],
      [setEnableTrackRecorderPanel({enable: true})],
    ]);
    expect(geolocationSpy.startRecording).toHaveBeenCalledBefore(storeSpy.dispatch);
  }

  it('loggato: start() avvia subito la registrazione senza aprire il login', fakeAsync(() => {
    isLogged$.next(true);

    component.start();
    flushMicrotasks();

    expectRecordingStarted();
    expect(modalCtrlSpy.create).not.toHaveBeenCalled();
  }));

  it('pannello di dettaglio chiuso: resta chiuso e si apre solo il pannello di registrazione', fakeAsync(() => {
    isLogged$.next(true);
    detailsStatus = 'background';

    component.start();
    flushMicrotasks();

    expect(geolocationSpy.startRecording).toHaveBeenCalledTimes(1);
    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(setEnableTrackRecorderPanel({enable: true}));
  }));

  it('non loggato, login riuscito: avvia la registrazione alla chiusura della modale', fakeAsync(() => {
    component.start();
    flushMicrotasks();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({component: LoginComponent}),
    );
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
    expect(geolocationSpy.startRecording).not.toHaveBeenCalled();

    isLogged$.next(true);
    resolveDismiss();
    flushMicrotasks();

    expectRecordingStarted();
  }));

  it('non loggato, login chiuso: nessuna azione', fakeAsync(() => {
    component.start();
    flushMicrotasks();

    resolveDismiss();
    flushMicrotasks();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
    expect(geolocationSpy.startRecording).not.toHaveBeenCalled();
  }));
});
