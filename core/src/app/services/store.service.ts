import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  public coinSizes = [
    {
      quantity:1,
      price:1
    },
    {
      quantity:10,
      price:10
    },
    {
      quantity:50,
      price:45
    },
    {
      quantity:100,
      price:80
    }
  ];

  constructor() { }

  async buy(coinQuantity : number): Promise<boolean> {
    console.log("------- ~ StoreService ~ buy ~ coinQuantity", coinQuantity);
    let success = false;
    
    // TODO buy coins
    success = true;

    return success;
  }

  getSizes(){
    return this.coinSizes;
  }
}
