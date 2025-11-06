import {Component} from '@angular/core';
import {MenuController, NavController} from '@ionic/angular';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {confAPP} from '@wm-core/store/conf/conf.selector';
import {APP} from '@wm-types/config';

@Component({
  selector: 'webmapp-home-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent {
  confAPP$: Observable<APP> = this._store.select(confAPP);

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private _store: Store<any>,
  ) {}

  goTo(pageName: string) {
    console.log('------- ~ IntroComponent ~ goTo ~ pageName', pageName);
    this.navCtrl.navigateForward(pageName);
    this.menu.close('appMenu');
  }

  menuOpen() {
    this.menu.enable(true, 'appMenu');
    this.menu.open('appMenu');
  }
}
