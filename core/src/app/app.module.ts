import {HttpClientModule} from '@angular/common/http';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {SQLite, SQLiteDatabaseConfig, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {WmCoreModule} from './shared/wm-core/wm-core.module';

import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {LOCALE_ID} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {GoogleAnalytics} from '@ionic-native/google-analytics/ngx';
import {ImagePicker} from '@ionic-native/image-picker/ngx';
import {IonicStorageModule} from '@ionic/storage-angular';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from 'src/environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MapModule} from './components/map/map.module';
import {ModalCoinsModule} from './components/modal-coins/modal-coins.module';
import {ModalGiftCoinsModule} from './components/modal-gift-coins/modal-gift-coin.module';
import {ModalStoreSuccessModule} from './components/modal-store-success/modal-store-success.module';
import {ModalSuccessModule} from './components/modal-success/modal-success.module';
import {ModalphotosModule} from './components/modalphotos/modalphotos.module';
import {SettingsModule} from './components/settings/settings.module';
import {SharedModule} from './components/shared/shared.module';
import {ConfigService} from './services/config.service';
import {ConfEffects} from './store/conf/conf.effects';
import {confReducer} from './store/conf/conf.reducer';
import {MapEffects} from './store/map/map.effects';
import {UIReducer} from './store/map/map.reducer';
import {NetworkEffects} from './store/network/network.effects';
import {networkReducer} from './store/network/netwotk.reducer';
import {PoisEffects} from './store/pois/pois.effects';
import {poisReducer} from './store/pois/pois.reducer';

// import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeIt);

class SQLiteMock {
  public create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
    return new Promise((resolve, reject) => {
      resolve(new SQLiteObject(new Object()));
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    // CDVPhotoLibraryPipe
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md',
    }),
    HttpClientModule,
    IonicStorageModule.forRoot({
      name: 'webmapp_app_storage',
      driverOrder: ['indexeddb', 'sqlite', 'websql', 'localstorage'],
    }),
    StoreModule.forRoot(
      {
        conf: confReducer,
        map: UIReducer,
        network: networkReducer,
        pois: poisReducer,
      },
      {},
    ),
    EffectsModule.forRoot([ConfEffects, MapEffects, NetworkEffects, PoisEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    AppRoutingModule,
    SharedModule,
    SettingsModule,
    ModalphotosModule,
    ModalSuccessModule,
    ModalCoinsModule,
    ModalStoreSuccessModule,
    ModalGiftCoinsModule,
    MapModule,
    WmCoreModule,
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'it'},
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.initialize(),
      deps: [ConfigService],
      multi: true,
    },
    Diagnostic,
    ImagePicker,
    GoogleAnalytics,
    SQLite,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
