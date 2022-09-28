import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.page.html',
  styleUrls: ['./disclaimer.page.scss'],
})
export class DisclaimerPage {
  constructor(private _modalCtrl: ModalController) {}

  cancel(): void {
    this._modalCtrl.dismiss();
  }
}
