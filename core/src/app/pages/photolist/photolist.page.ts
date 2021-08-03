import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';
import { PhotoItem } from 'src/app/services/photo.service';
import { SaveService } from 'src/app/services/save.service';

@Component({
  selector: 'webmapp-photolist',
  templateUrl: './photolist.page.html',
  styleUrls: ['./photolist.page.scss'],
})
export class PhotolistPage implements OnInit {

  public photos: PhotoItem[];

  constructor(
    private saveService: SaveService,
    private navController: NavController
  ) { }

  async ngOnInit() {
    this.photos = await this.saveService.getPhotos();
    }

  open(photo: PhotoItem) {
    const navigationExtras: NavigationOptions = {
      queryParams: {
        photo: JSON.stringify(photo)
      }
    };
    this.navController.navigateForward('photodetail', navigationExtras);
  }

}
