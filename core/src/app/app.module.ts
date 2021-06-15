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
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { CDVPhotoLibraryPipe } from './pipes/cdvphotolibrary.pipe';

@NgModule({
  declarations: [AppComponent, CDVPhotoLibraryPipe],
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
    MapModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () =>
        configService.initialize(),
      deps: [ConfigService],
      multi: true,
    },
    BackgroundGeolocation,
    Diagnostic,
    PhotoLibrary
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
