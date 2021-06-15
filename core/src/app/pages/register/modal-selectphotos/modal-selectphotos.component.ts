import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'webmapp-modal-selectphotos',
  templateUrl: './modal-selectphotos.component.html',
  styleUrls: ['./modal-selectphotos.component.scss'],
})
export class ModalSelectphotosComponent implements OnInit {

  public images = [];

  public isAllSelected = false;

  constructor(
    private modalController: ModalController,
    private photoService: PhotoService
  ) { }

  async ngOnInit() {
    const library = await this.photoService.getPhotos();
    library.forEach((libraryItem) => {
      const libraryItemCopy = Object.assign({ selected: false }, libraryItem);
      this.images.push(libraryItemCopy);
    });
  }

  close() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  save() {

  }

  selectAll(select: boolean) {
    console.log('---- ~ file: modal-selectphotos.component.ts ~ line 40 ~ ModalSelectphotosComponent ~ selectAll ~ select', select);
    this.isAllSelected = select;
  }

  select(id: number) {

    //check all selected
  }

  isValid() {
    return true;
  }

}
