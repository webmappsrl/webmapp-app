import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {LangService} from '@wm-core/localization/lang.service';
import {downloadPanelStatus} from '@wm-core/types/downloadpanel.enum';
import {WmFeature} from '@wm-types/feature';
import {LineString, MultiPolygon} from 'geojson';
@Component({
  selector: 'wm-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WmDownloadComponent implements OnInit {
  private _actualDownloadStatus: downloadPanelStatus;

  @Input() track: WmFeature<LineString>;
  @Input() overlayUrls: {[featureName: string]: string};
  @Input() overlayGeometry: any;
  @Input() overlayXYZ: string;
  @Input() boundingBox: WmFeature<MultiPolygon>;
  @Output() closeEvt: EventEmitter<void> = new EventEmitter<void>();
  @Output() goToEvt: EventEmitter<string> = new EventEmitter<string>();

  constructor(private _alertCtrl: AlertController, private _translate: LangService) {}

  ngOnInit(): void {}

  public downloadStatus(status: downloadPanelStatus) {
    this._actualDownloadStatus = status;
  }

  async endDownload(requireConfirm = false) {
    if (requireConfirm && this._actualDownloadStatus == downloadPanelStatus.DOWNLOADING) {
      const translation = await this._translate
        .get([
          'pages.itinerary.modalconfirm.title',
          'pages.itinerary.modalconfirm.text',
          'pages.itinerary.modalconfirm.confirm',
          'pages.itinerary.modalconfirm.cancel',
        ])
        .toPromise();

      const alert = await this._alertCtrl.create({
        cssClass: 'my-custom-class',
        header: translation['pages.itinerary.modalconfirm.title'],
        message: translation['pages.itinerary.modalconfirm.text'],
        buttons: [
          {
            text: translation['pages.itinerary.modalconfirm.cancel'],
            cssClass: 'webmapp-modalconfirm-btn',
            role: 'cancel',
            handler: () => {},
          },
          {
            text: translation['pages.itinerary.modalconfirm.confirm'],
            cssClass: 'webmapp-modalconfirm-btn',
            handler: () => {
              // this.showDownload = false;
            },
          },
        ],
      });

      await alert.present();
    } else {
      //   this.showDownload = false;
      this.goToEvt.emit('downloadlist');
    }
  }
}
