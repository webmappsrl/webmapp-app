import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalSelectphotosComponent } from '../modal-selectphotos/modal-selectphotos.component';

@Component({
  selector: 'webmapp-modal-save',
  templateUrl: './modal-save.component.html',
  styleUrls: ['./modal-save.component.scss'],
})
export class ModalSaveComponent implements OnInit {

  public title: string;
  public description: string;
  public activity: string;

  public photos: any[] = [];


  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() { }

  close() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  save() {

  }

  async addPhotos() {
    const modal = await this.modalController.create({
      component: ModalSelectphotosComponent,
      // cssClass: 'my-custom-class'
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    this.photos = res.data.photos;
    console.log('---- ~ file: modal-save.component.ts ~ line 40 ~ ModalSaveComponent ~ addPhotos ~ res', res);
  }

  remove(image) {
    const i = this.photos.findIndex(x => x.id === image.id);
    if (i > -1) {
      this.photos.splice(i, 1);
    }
  }

  isValid() {
    return !!this.title && !!this.activity;
  }

}
