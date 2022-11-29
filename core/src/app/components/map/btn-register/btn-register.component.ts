import {
  ActionSheetController,
  ModalController,
  NavController,
  PopoverController,
} from '@ionic/angular';
import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

import {DEF_MAP_LOCATION_ZOOM} from 'src/app/constants/map';
import {ESuccessType} from 'src/app/types/esuccess.enum';
import {GeolocationService} from 'src/app/services/geolocation.service';
import {ILocation} from 'src/app/types/location';
import {ModalSuccessComponent} from '../../modal-success/modal-success.component';
import {ModalphotosaveComponent} from '../../modalphotos/modalphotosave/modalphotosave.component';
import {PhotoService} from 'src/app/services/photo.service';
import {SaveService} from 'src/app/services/save.service';
import {TranslateService} from '@ngx-translate/core';
// import { PopoverRegisterComponent } from '../popover-register/popover-register.component';

@Component({
  selector: 'webmapp-btn-register',
  templateUrl: './btn-register.component.html',
  styleUrls: ['./btn-register.component.scss'],
})
export class BtnRegisterComponent implements OnInit {
  // @Input('color') color: string = '';
  @Input('registering') registering: boolean = false;

  public isPopOverPresented = false;
  private translations = [];

  // private popover: HTMLIonPopoverElement;

  constructor(
    // public popoverController: PopoverController,
    private actionSheetController: ActionSheetController,
    private translate: TranslateService,
    private _geolocationService: GeolocationService,
    private _modalController: ModalController,
    private _navCtrl: NavController,
    private _photoService: PhotoService,
    private _saveService: SaveService,
  ) {}

  ngOnInit() {
    this.translate
      .get([
        'components.map.register.title',
        'components.map.register.track',
        'components.map.register.photo',
        'components.map.register.waypoint',
        'components.map.register.vocal',
        'components.map.register.cancel',
      ])
      .subscribe(t => (this.translations = t));
  }

  async presentPopOver(ev: any) {
    //   this.popover = await this.popoverController.create({
    //     component: PopoverRegisterComponent,
    //     cssClass: 'popover-register',
    //     event: ev,
    //     translucent: true,
    //     mode: 'ios',
    //     // side: PositionSide1.left,
    //     componentProps: { registering: this.registering },
    //   });
    //   await this.popover.present();
    //   this.isPopOverPresented = true;
    //   const { role } = await this.popover.onDidDismiss();
    //   this.isPopOverPresented = false;
    const buttons = [
      {
        text: this.translations['components.map.register.track'],
        handler: () => {
          this.track();
        },
      },
      {
        text: this.translations['components.map.register.photo'],
        handler: () => {
          this.photo();
        },
      },
      {
        text: this.translations['components.map.register.waypoint'],
        handler: () => {
          this.waypoint();
        },
      },
      {
        text: this.translations['components.map.register.cancel'],
        role: 'cancel',
        handler: () => {},
      },
    ];
    if (this.registering) {
      buttons.shift();
    }
    this.actionSheetController
      .create({
        header: this.translations['components.map.register.title'],
        buttons,
      })
      .then(actionSheet => {
        actionSheet.present();
      });
  }

  track() {
    const location: ILocation = this._geolocationService.location;
    let state: any = {};

    if (location && location.latitude && location.longitude) {
      state = {
        startView: [location.longitude, location.latitude, DEF_MAP_LOCATION_ZOOM],
      };
    }

    this._navCtrl.navigateForward('register');
  }

  async photo() {
    let photoCollection = await this._photoService.addPhotos();

    const modal = await this._modalController.create({
      component: ModalphotosaveComponent,
      componentProps: {
        photos: photoCollection,
      },
    });
    await modal.present();
    const res = await modal.onDidDismiss();

    if (!res.data.dismissed) {
      await this._saveService.savePhotos(res.data.photos);

      await this.openModalSuccess(res.data.photos);
    }

    // Can be set to the src of an image now
    // imageElement.src = imageUrl;
  }

  waypoint() {
    this._navCtrl.navigateForward('waypoint');
  }

  vocal() {
    console.log(
      '---- ~ file: popover-register.component.ts ~ line 30 ~ PopoverRegisterComponent ~ vocal ~ vocal',
    );
  }

  async openModalSuccess(photos) {
    const modaSuccess = await this._modalController.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: ESuccessType.PHOTOS,
        photos,
      },
    });
    await modaSuccess.present();
    await modaSuccess.onDidDismiss();
  }
}
