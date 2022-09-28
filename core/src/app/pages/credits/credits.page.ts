import {Component} from '@angular/core';
import {ModalController} from '@ionic/angular';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.page.html',
  styleUrls: ['./credits.page.scss'],
})
export class CreditsPage {
  constructor(private _modalCtrl: ModalController) {}

  cancel(): void {
    this._modalCtrl.dismiss();
  }
}
