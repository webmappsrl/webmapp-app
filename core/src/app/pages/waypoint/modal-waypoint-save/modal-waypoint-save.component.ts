import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ModalSuccessComponent} from 'src/app/components/modal-success/modal-success.component';
import {SaveService} from 'src/app/services/save.service';
import {ILocation} from 'src/app/types/location';
import {ESuccessType} from 'src/app/types/esuccess.enum';
import {WaypointSave} from 'src/app/types/waypoint';
import {IPhotoItem, PhotoService} from 'src/app/services/photo.service';
import {Md5} from 'ts-md5';

@Component({
  selector: 'webmapp-modal-waypoint-save',
  templateUrl: './modal-waypoint-save.component.html',
  styleUrls: ['./modal-waypoint-save.component.scss'],
})
export class ModalWaypointSaveComponent implements OnInit {
  public position: ILocation;
  public displayPosition: ILocation;
  public title: string;
  public description: string;
  public waypointtype = 'waypoint';
  public photos: any[] = [];
  public validate = false;
  public isValidArray: boolean[] = [false, false];

  public positionString: string;
  public positionCity: string = 'città';

  constructor(
    private _modalController: ModalController,
    private _photoService: PhotoService,
    private _saveService: SaveService,
  ) {}

  ngOnInit() {
    this.positionString = `${this.position.latitude}, ${this.position.longitude}`;
    setTimeout(() => {
      this.displayPosition = this.position;
    }, 2000);
  }

  async save() {
    if (!this.isValid()) {
      return;
    }
    const waypoint: WaypointSave = {
      position: this.position,
      displayPosition: this.displayPosition,
      title: this.title,
      description: this.description,
      waypointtype: this.waypointtype,
      city: this.positionCity,
      date: new Date(),
      photos: this.photos,
    };

    await this._saveService.saveWaypoint(waypoint);

    this._modalController.dismiss();

    await this.openModalSuccess(waypoint);
  }

  close() {
    this._modalController.dismiss({
      dismissed: true,
    });
  }

  async openModalSuccess(waypoint) {
    const modaSuccess = await this._modalController.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: ESuccessType.WAYPOINT,
        waypoint,
      },
    });
    await modaSuccess.present();
    await modaSuccess.onDidDismiss();
  }

  async addPhotos() {
    const library = await this._photoService.getPhotos();
    library.forEach(async libraryItem => {
      const libraryItemCopy = Object.assign({selected: false}, libraryItem);
      const photoData = await this._photoService.getPhotoData(libraryItemCopy.photoURL),
        md5 = Md5.hashStr(JSON.stringify(photoData));
      let exists: boolean = false;
      for (let p of this.photos) {
        const pData = await this._photoService.getPhotoData(p.photoURL),
          pictureMd5 = Md5.hashStr(JSON.stringify(pData));
        if (md5 === pictureMd5) {
          exists = true;
          break;
        }
      }
      if (!exists) this.photos.push(libraryItemCopy);
    });
  }

  remove(image: IPhotoItem) {
    const i = this.photos.findIndex(
      x => x.photoURL === image.photoURL || (!!x.key && !!image.key && x.key === image.key),
    );
    if (i > -1) {
      this.photos.splice(i, 1);
    }
  }

  setIsValid(idx: number, isValid: boolean) {
    this.isValidArray[idx] = isValid;
  }

  isValid() {
    this.validate = true;
    const allValid = this.isValidArray.reduce((x, curr) => {
      return curr && x;
    }, true);
    return allValid;
  }
}
