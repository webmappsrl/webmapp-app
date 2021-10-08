import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalCoinsComponent } from '../components/modal-coins/modal-coins.component';
import { ModalGiftCoinsComponent } from '../components/modal-gift-coins/modal-gift-coins.component';
import { ModalStoreSuccessComponent } from '../components/modal-store-success/modal-store-success.component';

@Injectable({
  providedIn: 'root'
})
export class CoinService {

  constructor(
    private _modalController: ModalController
  ) { }

  async openModal(coins: number = null, cause: string = null): Promise<boolean> {
    let message: string = null;
    const modalAskCoins = await this._modalController.create({
      component: ModalCoinsComponent,
      componentProps: {
        message,
        coins
      },
    });
    await modalAskCoins.present();
    const AskRes = await modalAskCoins.onDidDismiss();
    if (AskRes.data.dismissed) {
      return false;
    }

    const modaSuccess = await this._modalController.create({
      component: ModalStoreSuccessComponent     
    });
    await modaSuccess.present();
    const successRes = await modaSuccess.onDidDismiss();
    if (successRes.data.dismissed) {
      return false;
    }

    return true;
  }

  async openGiftModal(coins: number = null) {
    const modalGiftCoins = await this._modalController.create({
      component: ModalGiftCoinsComponent,
      componentProps: {
        coins
      },
    });
    await modalGiftCoins.present();
    const GiftRes = await modalGiftCoins.onDidDismiss();
    if (GiftRes.data.dismissed) {
      return false;
    }
    return true;

   
  }


}
