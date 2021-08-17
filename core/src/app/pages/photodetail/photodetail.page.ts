import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPhotoItem } from 'src/app/services/photo.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'webmapp-photodetail',
  templateUrl: './photodetail.page.html',
  styleUrls: ['./photodetail.page.scss'],
})
export class PhotodetailPage implements OnInit {
  public photo: IPhotoItem;

  constructor(
    private _route: ActivatedRoute,
    private _menuController: MenuController
  ) {
    this._route.queryParams.subscribe((params) => {
      this.photo = JSON.parse(params.photo);
    });
  }

  ngOnInit() {}

  menu() {
    this._menuController.enable(true, 'optionMenu');
    this._menuController.open('optionMenu');
  }

  closeMenu() {
    this._menuController.close('optionMenu');
  }
}
