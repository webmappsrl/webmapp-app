import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {from, Observable} from 'rxjs';
import {getUgcMedias} from '@wm-core/utils/localForage';
import {Media, WmFeature} from '@wm-types/feature';
@Component({
  selector: 'webmapp-photolist',
  templateUrl: './photolist.page.html',
  styleUrls: ['./photolist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PhotolistPage {
  public medias$: Observable<WmFeature<Media>[]>;

  constructor(private _navCtrl: NavController, private _cdr: ChangeDetectorRef) {}

  ionViewWillEnter(): void {
    this.medias$ = from(getUgcMedias());
    this._cdr.detectChanges();
  }

  open(photo: WmFeature<Media>): void {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        photo: photo.properties.id,
      },
    };
    this._navCtrl.navigateForward('photodetail', navigationExtras);
  }
}
