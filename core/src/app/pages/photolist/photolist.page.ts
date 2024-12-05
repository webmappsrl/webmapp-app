import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IPhotoItem} from 'wm-core/services/photo.service';
import {SaveService} from 'wm-core/services/save.service';

@Component({
  selector: 'webmapp-photolist',
  templateUrl: './photolist.page.html',
  styleUrls: ['./photolist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PhotolistPage {
  public photos$: Observable<IPhotoItem[]>;

  constructor(
    private _saveSvc: SaveService,
    private _navCtrl: NavController,
    private _cdr: ChangeDetectorRef,
  ) {}

  ionViewWillEnter(): void {
    this.photos$ = from(this._saveSvc.getPhotos()).pipe(
      map((photos: IPhotoItem[]) => {
        const uniquePhotos = new Map<string, IPhotoItem>();
        photos.forEach(photo => {
          if (!uniquePhotos.has(photo.id)) {
            uniquePhotos.set(photo.id, photo);
          }
        });
        return Array.from(uniquePhotos.values());
      }),
    );
    this._cdr.detectChanges();
  }

  open(photo: IPhotoItem): void {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        photo: photo.key,
      },
    };
    this._navCtrl.navigateForward('photodetail', navigationExtras);
  }
}
