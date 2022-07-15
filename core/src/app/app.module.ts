import {APP_INITIALIZER, NgModule} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SQLite, SQLiteDatabaseConfig, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {elasticAllReducer, elasticSearchReducer} from './store/elastic/elastic.reducer';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {BrowserModule} from '@angular/platform-browser';
import {ConfEffects} from './store/conf/conf.effects';
import {ConfigService} from './services/config.service';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
import {EffectsModule} from '@ngrx/effects';
import {ElasticEffects} from './store/elastic/elastic.effects';
import {GoogleAnalytics} from '@ionic-native/google-analytics/ngx';
import {ImagePicker} from '@ionic-native/image-picker/ngx';
import {IonicStorageModule} from '@ionic/storage-angular';
import {LOCALE_ID} from '@angular/core';
import {MapEffects} from './store/map/map.effects';
import {MapModule} from './components/map/map.module';
import {ModalCoinsModule} from './components/modal-coins/modal-coins.module';
import {ModalGiftCoinsModule} from './components/modal-gift-coins/modal-gift-coin.module';
import {ModalStoreSuccessModule} from './components/modal-store-success/modal-store-success.module';
import {ModalSuccessModule} from './components/modal-success/modal-success.module';
import {ModalphotosModule} from './components/modalphotos/modalphotos.module';
import {NetworkEffects} from './store/network/network.effects';
import {RouteReuseStrategy} from '@angular/router';
import {SettingsModule} from './components/settings/settings.module';
import {SharedModule} from './components/shared/shared.module';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {StoreModule} from '@ngrx/store';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {UIReducer} from './store/map/map.reducer';
import {confReducer} from './store/conf/conf.reducer';
import {environment} from 'src/environments/environment';
import localeIt from '@angular/common/locales/it';
import {networkReducer} from './store/network/netwotk.reducer';
import {poisReducer} from './store/pois/pois.reducer';
import {registerLocaleData} from '@angular/common';
import {PoisEffects} from './store/pois/pois.effects';

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
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
        deps: [HttpClient],
      },
    }),
    IonicStorageModule.forRoot({
      name: 'webmapp_app_storage',
      driverOrder: ['indexeddb', 'sqlite', 'websql', 'localstorage'],
    }),
    StoreModule.forRoot(
      {
        conf: confReducer,
        search: elasticSearchReducer,
        all: elasticAllReducer,
        map: UIReducer,
        network: networkReducer,
        pois: poisReducer,
      },
      {},
    ),
    EffectsModule.forRoot([ConfEffects, ElasticEffects, MapEffects, NetworkEffects, PoisEffects]),
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
