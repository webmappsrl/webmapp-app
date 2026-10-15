import {TestBed, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {LoginComponent} from '@wm-core/login/login.component';
import {setEnablePoiRecorderPanel} from '@wm-core/store/user-activity/user-activity.action';
import {BehaviorSubject} from 'rxjs';

import {BtnAddPoiComponent} from './btn-add-poi.component';

describe('BtnAddPoiComponent (oc:8762)', () => {
  let isLogged$: BehaviorSubject<boolean>;
  let storeSpy: jasmine.SpyObj<Store>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let resolveDismiss: () => void;
  let component: BtnAddPoiComponent;

  beforeEach(() => {
    isLogged$ = new BehaviorSubject<boolean>(false);
    storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(isLogged$.asObservable());

    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onDidDismiss']);
    modalSpy.present.and.resolveTo();
    modalSpy.onDidDismiss.and.returnValue(
      new Promise(resolve => (resolveDismiss = () => resolve({data: undefined, role: undefined}))),
    );
    modalCtrlSpy = jasmine.createSpyObj<ModalController>('ModalController', ['create']);
    modalCtrlSpy.create.and.resolveTo(modalSpy);

    TestBed.configureTestingModule({
      providers: [
        {provide: Store, useValue: storeSpy},
        {provide: ModalController, useValue: modalCtrlSpy},
      ],
    });
    component = TestBed.runInInjectionContext(() => new BtnAddPoiComponent());
  });

  it('loggato: apre il pannello di creazione del POI senza aprire il login', fakeAsync(() => {
    isLogged$.next(true);

    component.start();
    flushMicrotasks();

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(setEnablePoiRecorderPanel({enable: true}));
    expect(modalCtrlSpy.create).not.toHaveBeenCalled();
  }));

  it('non loggato, login riuscito: apre il pannello alla chiusura della modale', fakeAsync(() => {
    component.start();
    flushMicrotasks();

    expect(modalCtrlSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({component: LoginComponent}),
    );
    expect(storeSpy.dispatch).not.toHaveBeenCalled();

    isLogged$.next(true);
    resolveDismiss();
    flushMicrotasks();

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(setEnablePoiRecorderPanel({enable: true}));
  }));

  it('non loggato, login chiuso: nessuna azione', fakeAsync(() => {
    component.start();
    flushMicrotasks();

    resolveDismiss();
    flushMicrotasks();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  }));
});
