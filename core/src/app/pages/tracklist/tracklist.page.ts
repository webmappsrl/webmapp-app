import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {Store} from '@ngrx/store';
import {from, Observable} from 'rxjs';
import {SaveService} from 'src/app/services/save.service';
import {confMAP} from 'src/app/shared/wm-core/store/conf/conf.selector';
import {ITrack} from 'src/app/types/track';

@Component({
  selector: 'wm-tracklist',
  templateUrl: './tracklist.page.html',
  styleUrls: ['./tracklist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TracklistPage {
  tracks$: Observable<ITrack[]>;
  confMap$: Observable<any> = this._store.select(confMAP);
  constructor(
    private _saveSvc: SaveService,
    private _navCtrl: NavController,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
  ) {}

  open(track): void {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        track: track.key,
      },
    };
    this._navCtrl.navigateForward('trackdetail', navigationExtras);
  }

  ionViewWillEnter(): void {
    this.tracks$ = from(this._saveSvc.getTracks());
    this._cdr.detectChanges();
  }
}
