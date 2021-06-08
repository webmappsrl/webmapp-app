import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { LanguagesService } from './services/languages.service';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private _languagesService: LanguagesService,
    private _platform: Platform
  ) {
    this._languagesService.initialize();

    this._platform.ready().then(
      () => {
        Plugins.SplashScreen.hide();
      },
      (err) => {
        Plugins.SplashScreen.hide();
      }
    );
  }
}
