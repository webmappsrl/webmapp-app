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
  template: `
  <ion-fab-button
    (click)="close()"
    color="light"
    size="small"
    class="wm-poi-recorder-close-btn"
  >
  <ion-icon name="arrow-back-outline"></ion-icon>
</ion-fab-button>
  <ion-card *ngIf="nominatim$|async as nominatim">
    <ion-card-header>
      <ion-card-title>
        {{'Ti trovi qui' | wmtrans}}
      </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <div>{{nominatim?.display_name}}</div>
      <div>{{nominatim?.lat}}, {{nominatim?.lon}}</div>
      <ion-button (click)="save()">
        <ion-icon slot="start"  name="pin-outline"></ion-icon>
        {{'Salva Waypoint' | wmtrans}}
      </ion-button>
    </ion-card-content>
  </ion-card>
  `,
  styles: [
    `
    wm-poi-recorder {
      .wm-poi-recorder-close-btn {
        position: absolute;
        top: calc(16px + constant(safe-area-inset-top, 30px));
        top: calc(16px + env(safe-area-inset-top, 30px));
        left: calc(16px + constant(safe-area-inset-left, 30px));
        left: calc(16px + env(safe-area-inset-left, 30px));
        margin: 0;
        z-index: 1000;
      }
      ion-card {
        position: absolute;
        left: calc(50px + env(safe-area-inset-left, 30px));
        right: calc(50px + env(safe-area-inset-right, 30px));
        top: calc(6px + env(safe-area-inset-top, 30px));
        border-radius: 15px;
        z-index: 10;

        ion-card-header {
          padding: 10px;
          border-bottom: 1px solid var(--wm-color-lightgray);

          ion-card-title {
            text-align: center;
          }
        }

        ion-card-content {
          min-height: 155px;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          padding-bottom: 6px !important;
          text-align: center;

          > div:first-child {
            font-weight: bold;
            color: var(--wm-color-dark);
          }

          ion-button {
            --border-radius: 20px;
          }
        }
      }

    }
    `,
  ],
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
