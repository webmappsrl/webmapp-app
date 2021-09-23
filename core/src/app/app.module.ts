import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { IonicStorageModule } from '@ionic/storage-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigService } from './services/config.service';
import { SharedModule } from './components/shared/shared.module';
import { SettingsModule } from './components/settings/settings.module';
import { MapModule } from './components/map/map.module';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { ModalphotosModule } from './components/modalphotos/modalphotos.module';
import { ModalSuccessModule } from './components/modal-success/modal-success.module';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { ModalCoinsModule } from './components/modal-coins/modal-coins.module';
import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from '@ionic-native/sqlite/ngx';
// import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeIt);

class SQLiteMock {
  public create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
  
      return new Promise((resolve,reject)=>{
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
    IonicModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) =>
          new TranslateHttpLoader(http, './assets/i18n/', '.json'),
        deps: [HttpClient],
      },
    }),
    IonicStorageModule.forRoot({
      name: 'webmapp_app_storage',
      driverOrder: ['indexeddb', 'sqlite', 'websql', 'localstorage'],
    }),
    AppRoutingModule,
    SharedModule,
    SettingsModule,
    ModalphotosModule,
    ModalSuccessModule,
    ModalCoinsModule,
    MapModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'it' },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () =>
        configService.initialize(),
      deps: [ConfigService],
      multi: true,
    },
    Diagnostic,
    ImagePicker,
    GoogleAnalytics,
    SQLite
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
