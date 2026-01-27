import {HttpClientModule} from '@angular/common/http';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {WmCoreModule} from '@wm-core/wm-core.module';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {LOCALE_ID} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicStorageModule} from '@ionic/storage-angular';
import {EffectsModule} from '@ngrx/effects';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from 'src/environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ModalCoinsModule} from './components/modal-coins/modal-coins.module';
import {ModalGiftCoinsModule} from './components/modal-gift-coins/modal-gift-coin.module';
import {ModalStoreSuccessModule} from './components/modal-store-success/modal-store-success.module';
import {ModalSuccessModule} from './components/modal-success/modal-success.module';
import {SettingsModule} from './components/settings/settings.module';
import {SharedModule} from './components/shared/shared.module';
import packageJson from 'package.json';
import {StoreModule} from '@ngrx/store';
import {appDE} from 'src/assets/i18n/de';
import {appEN} from 'src/assets/i18n/en';
import {appES} from 'src/assets/i18n/es';
import {appFR} from 'src/assets/i18n/fr';
import {appIT} from 'src/assets/i18n/it';
import {appPR} from 'src/assets/i18n/pr';
import {appSQ} from 'src/assets/i18n/sq';
import {WmTranslations} from '@wm-types/language';
import {MetaComponent} from '@wm-core/meta/meta.component';
import posthogConfig from '../../../posthog.json';
registerLocaleData(localeIt);
export const langs: WmTranslations = {
  'de': appDE,
  'en': appEN,
  'es': appES,
  'fr': appFR,
  'it': appIT,
  'pr': appPR,
  'sq': appSQ,
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md',
    }),
    HttpClientModule,
    IonicStorageModule.forRoot({
      name: 'webmapp_app_storage',
      driverOrder: ['indexeddb', 'websql', 'localstorage'],
    }),
    EffectsModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    StoreModule.forRoot(),
    AppRoutingModule,
    SharedModule,
    SettingsModule,
    ModalSuccessModule,
    ModalCoinsModule,
    ModalStoreSuccessModule,
    ModalGiftCoinsModule,
    WmCoreModule,
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'it'},
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    ...WmCoreModule.forRoot({
      appVersion: packageJson.version,
      environment: environment,
      translations: langs,
      posthog: {
        apiKey: posthogConfig.POSTHOG_KEY,
        host: posthogConfig.POSTHOG_HOST,
        enabled: true,
      },
    }).providers!,
  ],
  bootstrap: [AppComponent, MetaComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
