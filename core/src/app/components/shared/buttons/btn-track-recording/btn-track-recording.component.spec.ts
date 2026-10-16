import {fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {
  setEnablePoiRecorderPanel,
  setEnableTrackRecorderPanel,
} from '@wm-core/store/user-activity/user-activity.action';
import {BehaviorSubject} from 'rxjs';

import {BtnTrackRecordingComponent} from './btn-track-recording.component';

describe('BtnTrackRecordingComponent (oc:8762)', () => {
  let isLogged$: BehaviorSubject<boolean>;
  let storeSpy: jasmine.SpyObj<Store>;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;
  let resolveDismiss: () => void;
  let component: BtnTrackRecordingComponent;

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

    component = new BtnTrackRecordingComponent(storeSpy, modalCtrlSpy);
  });

  it('track(), non loggato, login riuscito: apre il pannello della traccia senza un secondo tocco', fakeAsync(() => {
    component.track();
    flushMicrotasks();
    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();

    isLogged$.next(true);
    resolveDismiss();
    flushMicrotasks();

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(setEnableTrackRecorderPanel({enable: true}));
  }));

  it('waypoint(), non loggato, login chiuso: nessuna azione', fakeAsync(() => {
    component.waypoint();
    flushMicrotasks();
    resolveDismiss();
    flushMicrotasks();

    expect(modalCtrlSpy.create).toHaveBeenCalled();
    expect(storeSpy.dispatch).not.toHaveBeenCalled();
  }));

  it('waypoint(), loggato: apre il pannello del POI', fakeAsync(() => {
    isLogged$.next(true);

    component.waypoint();
    flushMicrotasks();

    expect(storeSpy.dispatch).toHaveBeenCalledOnceWith(setEnablePoiRecorderPanel({enable: true}));
    expect(modalCtrlSpy.create).not.toHaveBeenCalled();
  }));
});
