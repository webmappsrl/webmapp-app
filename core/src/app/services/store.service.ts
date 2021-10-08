import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalCoinsComponent } from '../components/modal-coins/modal-coins.component';
import { ModalStoreSuccessComponent } from '../components/modal-store-success/modal-store-success.component';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  public coinSizes = [
    {
      quantity: 1,
      price: 1
    },
    {
      quantity: 10,
      price: 10
    },
    {
      quantity: 50,
      price: 45
    },
    {
      quantity: 100,
      price: 80
    }
  ];

  constructor(
    private _modalController: ModalController
  ) { }

  async buy(coinQuantity: number): Promise<boolean> {
    console.log("------- ~ StoreService ~ buy ~ coinQuantity", coinQuantity);
    let success = false;

    // TODO buy coins
    success = true;

    return success;
  }

  getSizes() {
    return this.coinSizes;
  }
  
}
