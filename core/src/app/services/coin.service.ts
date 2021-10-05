import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalCoinsComponent } from '../components/modal-coins/modal-coins.component';

@Injectable({
  providedIn: 'root'
})
export class CoinService {

  constructor(
    private _modalController: ModalController
  ) { }

  async openModal(coins: number = null, cause: string = null) {
    let message: string = null;
    const modaSuccess = await this._modalController.create({
      component: ModalCoinsComponent,
      componentProps: {
        message,
        coins
      },
    });
    await modaSuccess.present();
    await modaSuccess.onDidDismiss();

  }
}
