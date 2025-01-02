import {ChangeDetectionStrategy, Component} from '@angular/core';

import {DomSanitizer} from '@angular/platform-browser';
import {ModalController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {confPROJECT} from '@wm-core/store/conf/conf.selector';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPage {
  innerHtml$ = this._store.select(confPROJECT);

  constructor(
    public sanitizer: DomSanitizer,
    private _store: Store,
    private _modalCtrl: ModalController,
  ) {}

  cancel(): void {
    this._modalCtrl.dismiss();
  }
}
