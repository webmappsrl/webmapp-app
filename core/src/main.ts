import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {defineCustomElements} from '@ionic/pwa-elements/loader';

if (environment.production) {
  enableProdMode();
  // Override di console.log
  (function () {
    console.log = function (...args: any[]) {};
  })();
}

console.log('🚀 Starting Angular app...');
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .then(() => console.log('✅ Angular app bootstrapped successfully'))
  .catch(err => {
    console.error('❌ Error bootstrapping Angular app:', err);
    console.log(err);
  });

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);
