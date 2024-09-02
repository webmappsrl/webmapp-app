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
import { SaveService } from 'wm-core/services/save.service';
import {confMAP} from 'wm-core/store/conf/conf.selector';
import { ITrack } from 'wm-core/types/track';

@Component({
  selector: 'wm-tracklist',
  templateUrl: './tracklist.page.html',
  styleUrls: ['./tracklist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TracklistPage {
  confMap$: Observable<any> = this._store.select(confMAP);
  tracks$: Observable<ITrack[]>;

  constructor(
    private _saveSvc: SaveService,
    private _navCtrl: NavController,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
  ) {}

  ionViewWillEnter(): void {
    this.tracks$ = from(this._saveSvc.getTracks());
    this._cdr.detectChanges();
  }

  open(track): void {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        track: track.key,
      },
    };
    this._navCtrl.navigateForward('trackdetail', navigationExtras);
  }
}
