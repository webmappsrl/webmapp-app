import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

import {ModalController} from '@ionic/angular';
import {StatusService} from 'src/app/services/status.service';
import {TranslateService} from '@ngx-translate/core';
import {WmTransPipe} from 'src/app/pipes/wmtrans.pipe';

@Component({
  selector: 'app-modal-store-success',
  templateUrl: './modal-store-success.component.html',
  styleUrls: ['./modal-store-success.component.scss'],
})
export class ModalStoreSuccessComponent implements OnInit {
  public trackname: string = null;

  constructor(
    private _modalController: ModalController,
    private _statusSvc: StatusService,
    private _translateSvc: TranslateService,
    private _cdr: ChangeDetectorRef,
  ) {}

  close() {
    // back
    this._modalController.dismiss({
      dismissed: true,
    });
  }

  download() {
    //continue download
    this._modalController.dismiss({
      dismissed: false,
    });
  }

  ngOnInit() {
    if (this._statusSvc.route) {
      let f = new WmTransPipe(this._translateSvc, this._cdr);
      this.trackname = f.transform(this._statusSvc.route.properties.name);
    }
  }
}
