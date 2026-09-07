import {TestBed} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {Platform} from '@ionic/angular';
import {BehaviorSubject, of} from 'rxjs';

import {HomePage} from './home.page';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {currentEcLayer, ugcOpened} from '@wm-core/store/user-activity/user-activity.selector';
import {currentEcTrack, currentEcPoi} from '@wm-core/store/features/ec/ec.selector';

describe('HomePage', () => {
  let urlHandlerSvcSpy: jasmine.SpyObj<UrlHandlerService>;
  let selectorSubjects: Map<any, BehaviorSubject<any>>;

  beforeEach(() => {
    TestBed.resetTestingModule();

    selectorSubjects = new Map([
      [currentEcLayer, new BehaviorSubject<any>(null)],
      [ugcOpened, new BehaviorSubject<any>(false)],
      [currentEcTrack, new BehaviorSubject<any>(null)],
      [currentEcPoi, new BehaviorSubject<any>(null)],
    ]);

    const storeSpy = jasmine.createSpyObj<Store>('Store', ['select']);
    storeSpy.select.and.callFake((selector: any) => {
      const subject = selectorSubjects.get(selector);
      return subject ? subject.asObservable() : of(null);
    });

    urlHandlerSvcSpy = jasmine.createSpyObj<UrlHandlerService>('UrlHandlerService', [
      'changeURL',
    ]);
    const platformStub: Partial<Platform> = {
      backButton: {subscribeWithPriority: () => ({unsubscribe: () => {}})} as any,
    };

    TestBed.configureTestingModule({
      providers: [
        HomePage,
        {provide: Store, useValue: storeSpy},
        {provide: Platform, useValue: platformStub},
        {provide: UrlHandlerService, useValue: urlHandlerSvcSpy},
      ],
    });

    TestBed.inject(HomePage);
  });

  it('naviga su map quando currentEcTrack diventa non-null', () => {
    selectorSubjects.get(currentEcTrack).next({properties: {id: 123}});

    expect(urlHandlerSvcSpy.changeURL).toHaveBeenCalledWith('map');
  });

  it('naviga su map quando currentEcPoi diventa non-null', () => {
    selectorSubjects.get(currentEcPoi).next({properties: {id: 456}});

    expect(urlHandlerSvcSpy.changeURL).toHaveBeenCalledWith('map');
  });

  it('naviga su map quando currentEcLayer diventa non-null (comportamento preesistente)', () => {
    selectorSubjects.get(currentEcLayer).next({id: 789});

    expect(urlHandlerSvcSpy.changeURL).toHaveBeenCalledWith('map');
  });

  it('naviga su map quando ugcOpened diventa true (comportamento preesistente)', () => {
    selectorSubjects.get(ugcOpened).next(true);

    expect(urlHandlerSvcSpy.changeURL).toHaveBeenCalledWith('map');
  });

  it('non naviga quando ugcOpened torna a false', () => {
    selectorSubjects.get(ugcOpened).next(false);

    expect(urlHandlerSvcSpy.changeURL).not.toHaveBeenCalled();
  });
});
