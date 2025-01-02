import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
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
import {ModalphotosModule} from './components/modalphotos/modalphotos.module';
import {SettingsModule} from './components/settings/settings.module';
import {SharedModule} from './components/shared/shared.module';
import {NetworkEffects} from './store/network/network.effects';
import {networkReducer} from './store/network/netwotk.reducer';
import packageJson from 'package.json';
import {APP_ID, APP_VERSION, ENVIRONMENT_CONFIG} from '@wm-core/store/conf/conf.token';
import {ConfService} from '@wm-core/store/conf/conf.service';
import {StoreModule} from '@ngrx/store';

registerLocaleData(localeIt);

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
    EffectsModule.forRoot([NetworkEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    StoreModule.forRoot(
      {
        network: networkReducer,
      },
      {},
    ),
    AppRoutingModule,
    SharedModule,
    SettingsModule,
    ModalphotosModule,
    ModalSuccessModule,
    ModalCoinsModule,
    ModalStoreSuccessModule,
    ModalGiftCoinsModule,
    WmCoreModule,
  ],
  providers: [
    {provide: ENVIRONMENT_CONFIG, useValue: environment},
    {provide: LOCALE_ID, useValue: 'it'},
    {
      provide: APP_ID,
      useFactory: (confSvc: ConfService) => confSvc.geohubAppId,
      deps: [ConfService],
    },
    {
      provide: APP_VERSION,
      useValue: packageJson.version,
    },
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
