import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/store.service';

@Component({
  standalone: false,
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
})
export class StorePage implements OnInit {

  public coinSizes : any[] = [];

  constructor(
    private storeService: StoreService
  ) { }

  ngOnInit() {
    this.coinSizes = this.storeService.getSizes();
  }

  async buy(qty){
    const success = await this.storeService.buy(qty);
    if(success){

    }
  }

}
