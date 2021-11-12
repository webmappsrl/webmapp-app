import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-gift-coins',
  templateUrl: './modal-gift-coins.component.html',
  styleUrls: ['./modal-gift-coins.component.scss'],
})
export class ModalGiftCoinsComponent implements OnInit {

  constructor(
    private _modalController: ModalController
  ) { }

  ngOnInit() {
   
  }

  close() {
    this._modalController.dismiss({
      dismissed: true,
    });

  }

}
