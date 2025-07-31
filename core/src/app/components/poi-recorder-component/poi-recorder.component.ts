import {ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation} from '@angular/core';
import {Store} from '@ngrx/store';
import {currentLocation} from '@wm-core/store/user-activity/user-activity.selector';
import {Location} from '@wm-types/feature';
import {BehaviorSubject, from, Observable, Subscription} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {NominatimService} from 'src/app/services/nominatim.service';
import {ModalController} from '@ionic/angular';
import {confPOIFORMS} from '@wm-core/store/conf/conf.selector';
import {setEnablePoiRecorderPanel} from '@wm-core/store/user-activity/user-activity.action';
import {ModalSaveComponent} from '../shared/modal-save/modal-save.component';

@Component({
  selector: 'wm-poi-recorder',
  templateUrl: './poi-recorder.component.html',
  styleUrls: ['./poi-recorder.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoiRecorderComponent implements OnDestroy {
  currentPosition$: Observable<Location> = this._store.select(currentLocation);
  currentPositionSub$: Subscription;
  nominatim$: BehaviorSubject<any> = new BehaviorSubject(null);
  confPOIFORMS$: Observable<any[]> = this._store.select(confPOIFORMS);
  constructor(
    private _store: Store,
    private _nominatimSvc: NominatimService,
    private _modalCtrl: ModalController,
  ) {
    this.currentPositionSub$ = this.currentPosition$
      .pipe(switchMap(position => this._nominatimSvc.getFromPosition(position)))
      .subscribe(nominatim => {
        this.nominatim$.next(nominatim);
      });
  }

  ngOnDestroy(): void {
    this.currentPositionSub$.unsubscribe();
  }

  save(): void {
    this.currentPosition$
      .pipe(
        take(1),
        switchMap(position => {
          return from(
            this._modalCtrl.create({
              component: ModalSaveComponent,
              componentProps: {
                isWaypoint: true,
                position: position,
                nominatim: this.nominatim$.value,
                acquisitionFORM$: this.confPOIFORMS$,
              },
            }),
          );
        }),
      )
      .subscribe(modal => {
        modal.present();
        this._store.dispatch(setEnablePoiRecorderPanel({enable: false}));
      });
  }

  close(): void {
    this._store.dispatch(setEnablePoiRecorderPanel({enable: false}));
  }
}
