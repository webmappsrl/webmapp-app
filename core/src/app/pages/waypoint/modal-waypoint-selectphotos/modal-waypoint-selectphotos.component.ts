import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {CameraService} from '@wm-core/services/camera.service';

@Component({
  selector: 'webmapp-modal-selectphotos',
  templateUrl: './modal-waypoint-selectphotos.component.html',
  styleUrls: ['./modal-waypoint-selectphotos.component.scss'],
})
export class ModalWaypointSelectphotosComponent implements OnInit {
  public images = [];

  public isAllSelected = false;

  constructor(private _modalController: ModalController, private _cameraSvc: CameraService) {}

  async ngOnInit() {
    const library = await this._cameraSvc.getPhotos();
    library.forEach(libraryItem => {
      const libraryItemCopy = Object.assign({selected: false}, libraryItem);
      this.images.push(libraryItemCopy);
    });
  }

  close() {
    this._modalController.dismiss({
      dismissed: true,
    });
  }

  save() {
    const selectedPhotos = [];

    for (const image of this.images) {
      if (image.selected) {
        selectedPhotos.push(image);
      }
    }
    this._modalController.dismiss({
      dismissed: true,
      photos: selectedPhotos,
    });
  }

  selectAll(select: boolean) {
    this.isAllSelected = select;
    for (const image of this.images) {
      image.selected = select;
    }
  }

  select(event) {
    //check all selected
    let isAllSelected = true;
    for (const image of this.images) {
      isAllSelected = isAllSelected && image.selected;
    }
    this.isAllSelected = isAllSelected;
  }

  isValid() {
    for (const image of this.images) {
      if (image.selected) return true;
    }
    return false;
  }
}
