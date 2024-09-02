import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PhotoService } from 'wm-core/services/photo.service';

@Component({
  selector: 'webmapp-modal-selectphotos',
  templateUrl: './modal-selectphotos.component.html',
  styleUrls: ['./modal-selectphotos.component.scss'],
})
export class ModalSelectphotosComponent implements OnInit {
  public images = [];

  public isAllSelected = false;

  constructor(
    private _modalController: ModalController,
    private _photoService: PhotoService
  ) {}

  async ngOnInit() {
    const library = await this._photoService.getPhotos();
    library.forEach((libraryItem) => {
      const libraryItemCopy = Object.assign({ selected: false }, libraryItem);
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
