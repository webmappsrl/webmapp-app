import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IPhotoItem } from 'wm-core/services/photo.service';

@Component({
  selector: 'app-modal-photo-single',
  templateUrl: './modal-photo-single.component.html',
  styleUrls: ['./modal-photo-single.component.scss'],
})
export class ModalPhotoSingleComponent implements OnInit {

  public photo:IPhotoItem;
  public photos:IPhotoItem[];

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {

  }

  done(){
    this.modalController.dismiss({
      dismissed: true,
    });
  }

}
