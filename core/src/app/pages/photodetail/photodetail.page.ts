import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IPhotoItem} from 'src/app/services/photo.service';
import {MenuController} from '@ionic/angular';
import {SaveService} from 'src/app/services/save.service';
import {switchMap} from 'rxjs/operators';
import {from, Observable} from 'rxjs';

@Component({
  selector: 'webmapp-photodetail',
  templateUrl: './photodetail.page.html',
  styleUrls: ['./photodetail.page.scss'],
})
export class PhotodetailPage {
  public photo$: Observable<IPhotoItem>;

  constructor(
    private _route: ActivatedRoute,
    private _menuController: MenuController,
    private _saveSvc: SaveService,
  ) {
    this.photo$ = this._route.queryParams.pipe(
      switchMap(param => from(this._saveSvc.getPhoto(param.photo))),
    );
  }

  closeMenu() {
    this._menuController.close('optionMenu');
  }

  menu() {
    this._menuController.enable(true, 'optionMenu');
    this._menuController.open('optionMenu');
  }
}
