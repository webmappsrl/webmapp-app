import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {NavigationOptions} from '@ionic/angular/providers/nav-controller';
import {IPhotoItem} from 'src/app/services/photo.service';
import {SaveService} from 'src/app/services/save.service';

@Component({
  selector: 'webmapp-photolist',
  templateUrl: './photolist.page.html',
  styleUrls: ['./photolist.page.scss'],
})
export class PhotolistPage implements OnInit {
  public photos: IPhotoItem[];

  constructor(private _saveService: SaveService, private _navController: NavController) {}

  async ngOnInit() {
    this.photos = await this._saveService.getPhotos();
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
