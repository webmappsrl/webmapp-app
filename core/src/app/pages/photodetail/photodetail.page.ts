import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhotoItem } from 'src/app/services/photo.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'webmapp-photodetail',
  templateUrl: './photodetail.page.html',
  styleUrls: ['./photodetail.page.scss'],
})
export class PhotodetailPage implements OnInit {

  public photo: PhotoItem;

  constructor(
    private route: ActivatedRoute,
    private menuController: MenuController
  ) {
    this.route.queryParams.subscribe(params => {
      this.photo = JSON.parse(params['photo']);
    });
  }

  ngOnInit() {
    console.log('------- ~ file: photodetail.page.ts ~ line 27 ~ PhotodetailPage ~ ngOnInit ~ this.photo', this.photo);

  }

  menu() {
    this.menuController.enable(true, 'optionMenu');
    this.menuController.open('optionMenu');
  }

  closeMenu() {
    this.menuController.close('optionMenu');
  }

}
