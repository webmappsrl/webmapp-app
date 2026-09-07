import {Store} from '@ngrx/store';
import {BehaviorSubject, of} from 'rxjs';

import {MapDetailsComponent} from './map-details.component';
import {featureOpened} from '@wm-core/store/features/features.selector';
import {setMapDetailsStatus} from '@wm-core/store/user-activity/user-activity.action';

describe('MapDetailsComponent', () => {
  let component: MapDetailsComponent;
  let storeSpy: jasmine.SpyObj<Store>;
  let featureOpened$: BehaviorSubject<boolean>;

  beforeEach(() => {
    // true già al mount: simula il caso reale (feature selezionato PRIMA che il
    // componente esista, es. da un deep-link/query param iniziale — oc:8470)
    featureOpened$ = new BehaviorSubject<boolean>(true);

    storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    storeSpy.select.and.callFake((selector: any) => {
      if (selector === featureOpened) return featureOpened$.asObservable();
      return of('background');
    });

    const elRefStub = {nativeElement: {offsetHeight: 500}};
    component = new MapDetailsComponent(elRefStub as any, {} as any, {} as any, {} as any, storeSpy);
    spyOn(component as any, 'setAnimations');
    spyOn(component as any, '_setGesture');
  });

  it('apre il pannello se il feature è già selezionato al momento del mount (oc:8470)', () => {
    component.ngAfterViewInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(setMapDetailsStatus({status: 'open'}));
  });

  it('non apre il pannello se nessun feature è selezionato al mount', () => {
    featureOpened$.next(false);

    component.ngAfterViewInit();

    expect(storeSpy.dispatch).not.toHaveBeenCalledWith(setMapDetailsStatus({status: 'open'}));
  });

  it('apre il pannello su una transizione a true dopo il mount (comportamento preesistente)', () => {
    featureOpened$.next(false);
    component.ngAfterViewInit();
    storeSpy.dispatch.calls.reset();

    featureOpened$.next(true);

    expect(storeSpy.dispatch).toHaveBeenCalledWith(setMapDetailsStatus({status: 'open'}));
  });
});
