import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {from, Observable} from 'rxjs';
import {IPhotoItem} from 'src/app/services/photo.service';
import {SaveService} from 'src/app/services/save.service';

@Component({
  selector: 'webmapp-photolist',
  templateUrl: './photolist.page.html',
  styleUrls: ['./photolist.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PhotolistPage implements OnInit {
  public photos$: Observable<IPhotoItem[]>;

  constructor(private _saveService: SaveService, private _navController: NavController) {}

  async ngOnInit() {
    this.photos$ = from(this._saveService.getPhotos());
  }

  open(photo: IPhotoItem) {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        photo: photo.key,
      },
    };
    this._navController.navigateForward('photodetail', navigationExtras);
  }
}
