import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { WmTransPipe } from 'src/app/pipes/wmtrans.pipe';
import { StatusService } from 'src/app/services/status.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-modal-store-success',
  templateUrl: './modal-store-success.component.html',
  styleUrls: ['./modal-store-success.component.scss'],
})
export class ModalStoreSuccessComponent implements OnInit {

  public trackname: string = null;

  constructor(
    private _modalController: ModalController,
    private statusService: StatusService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    if (this.statusService.route) {
      let f = new WmTransPipe(this.translate);      
      this.trackname = f.transform(this.statusService.route.properties.name);
    }

  }

  download() {
    //continue download
    this._modalController.dismiss({
      dismissed: false,
    });

  }

  close() {
    // back
    this._modalController.dismiss({
      dismissed: true,
    });

  }


}
