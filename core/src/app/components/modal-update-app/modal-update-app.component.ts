import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {Browser} from '@capacitor/browser';
import {Capacitor} from '@capacitor/core';
import {DeviceService} from '@wm-core/services/device.service';

@Component({
  selector: 'wm-modal-update-app',
  templateUrl: './modal-update-app.component.html',
  styleUrls: ['./modal-update-app.component.scss'],
})
export class ModalUpdateAppComponent implements OnInit {
  @Input() storeUrl: string;
  @Input() productionVersion: string | null;

  constructor(private _modalController: ModalController, private _deviceService: DeviceService) {}

  ngOnInit() {}

  async openStore() {
    console.log('[UPDATE POPUP] openStore chiamato con URL:', this.storeUrl);
    console.log('[UPDATE POPUP] Piattaforma:', Capacitor.getPlatform());
    console.log('[UPDATE POPUP] isIos:', this._deviceService.isIos);
    console.log('[UPDATE POPUP] isAndroid:', this._deviceService.isAndroid);

    if (!this.storeUrl) {
      console.warn('[UPDATE POPUP] storeUrl non disponibile');
      this.close();
      return;
    }

    // Su iOS simulator o browser, usa direttamente window.open
    const platform = Capacitor.getPlatform();
    if (platform === 'ios' || platform === 'web' || !Capacitor.isNativePlatform()) {
      console.log('[UPDATE POPUP] Uso window.open (iOS simulator/browser)');
      window.open(this.storeUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Su dispositivo nativo, prova Browser.open
      try {
        console.log('[UPDATE POPUP] Provo Browser.open su piattaforma nativa');
        await Browser.open({url: this.storeUrl});
        console.log('[UPDATE POPUP] Browser.open completato');
      } catch (error) {
        console.error('[UPDATE POPUP] Errore Browser.open, uso window.open come fallback:', error);
        window.open(this.storeUrl, '_blank', 'noopener,noreferrer');
      }
    }

    this.close();
  }

  close() {
    this._modalController.dismiss({
      dismissed: true,
    });
  }
}
