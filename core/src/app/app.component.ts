import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { LanguagesService } from './services/languages.service';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'webmapp-app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private _languagesService: LanguagesService,
    private _platform: Platform,
    private _googleAnalytics: GoogleAnalytics
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

    this._googleAnalytics.startTrackerWithId(environment.analyticsId)
   .then(() => {
     console.log('Google analytics is ready now');
      this._googleAnalytics.trackView('test');
     // Tracker is ready
     // You can now track pages or set additional information such as AppVersion or UserId
   })
   .catch(e => console.log('Error starting GoogleAnalytics', e));

  }
}
