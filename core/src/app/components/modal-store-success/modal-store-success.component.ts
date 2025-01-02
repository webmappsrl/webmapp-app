import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

import {ModalController} from '@ionic/angular';
import {StatusService} from 'src/app/services/status.service';
import {LangService} from '@wm-core/localization/lang.service';

@Component({
  selector: 'app-modal-store-success',
  templateUrl: './modal-store-success.component.html',
  styleUrls: ['./modal-store-success.component.scss'],
  providers: [LangService],
})
export class ModalStoreSuccessComponent implements OnInit {
  public trackname: string = null;

  constructor(
    private _modalController: ModalController,
    private _statusSvc: StatusService,
    private _translateSvc: LangService,
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
      this.trackname = this._translateSvc.instant(
        this._statusSvc.route.properties.name[this._translateSvc.currentLang] || '',
      );
    }
  }
}
