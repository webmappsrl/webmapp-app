import packageJson from "package.json";
import posthogConfig from "posthog.json";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ModalCoinsModule } from "./components/modal-coins/modal-coins.module";
import { ModalGiftCoinsModule } from "./components/modal-gift-coins/modal-gift-coin.module";
import { ModalStoreSuccessModule } from "./components/modal-store-success/modal-store-success.module";
import { ModalSuccessModule } from "./components/modal-success/modal-success.module";
import { SettingsModule } from "./components/settings/settings.module";
import { SharedModule } from "./components/shared/shared.module";
import { PosthogHybridClient } from "./services/base/posthog-hybrid.client";
import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import localeIt from "@angular/common/locales/it";
import { APP_INITIALIZER, LOCALE_ID, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { Capacitor } from "@capacitor/core";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { IonicStorageModule } from "@ionic/storage-angular";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { MetaComponent } from "@wm-core/meta/meta.component";
import { EnvironmentService } from "@wm-core/services/environment.service";
import { PosthogService } from "@wm-core/services/posthog.service";
import { APP_TRANSLATION, APP_VERSION, POSTHOG_CLIENT, POSTHOG_CONFIG } from "@wm-core/store/conf/conf.token";
import { initializeConsoleOverride } from "@wm-core/utils/console-override";
import { WmCoreModule } from "@wm-core/wm-core.module";
import { WmPosthogConfig } from "@wm-types/posthog";
import { appEN } from "src/assets/i18n/en";
import { appFR } from "src/assets/i18n/fr";
import { appIT } from "src/assets/i18n/it";
import { environment } from "src/environments/environment";

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
    {
      provide: APP_VERSION,
      useValue: packageJson.version,
    },
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {
      provide: APP_TRANSLATION,
      useValue: {
        'it': appIT,
        'en': appEN,
        'fr': appFR,
      },
    },
    {
      provide: POSTHOG_CONFIG,
      useValue: (() => {
        // Log per verificare che posthog.json sia letto correttamente
        console.log('[PostHog] Loading config from posthog.json:', {
          hasKey: !!posthogConfig?.POSTHOG_KEY,
          hasHost: !!posthogConfig?.POSTHOG_HOST,
          keyPreview: posthogConfig?.POSTHOG_KEY
            ? `${posthogConfig.POSTHOG_KEY.substring(0, 10)}...`
            : 'missing',
          host: posthogConfig?.POSTHOG_HOST || 'missing',
        });
        return {
          apiKey: posthogConfig?.POSTHOG_KEY || '',
          host: posthogConfig?.POSTHOG_HOST || 'https://posthog.webmapp.it',
          enabled: true,
        } satisfies WmPosthogConfig;
      })(),
    },
    PosthogHybridClient,
    {provide: POSTHOG_CLIENT, useExisting: PosthogHybridClient},
    {
      provide: APP_INITIALIZER,
      useFactory:
        (
          envSvc: EnvironmentService,
          posthogClient: PosthogHybridClient,
          posthogSvc: PosthogService,
        ) =>
        async () => {
          // Inizializza EnvironmentService
          envSvc.init(environment);
          // Aspetta che EnvironmentService sia pronto
          await envSvc.readyPromise;

          // Inizializza l'override di console dopo aver inizializzato l'environment
          initializeConsoleOverride(environment);

          // Prepara le proprietà super di PostHog con controlli e valori di default
          const appId = envSvc.appId;
          const shardName = envSvc.shardName;
          const appVersion = packageJson.version;
          const appBuild = packageJson.version;
          const appPlatform = Capacitor.getPlatform();

          // Log per identificare valori undefined
          if (appId === undefined || appId === null) {
            console.error('[PostHog] app_id is undefined/null!', {appId, envSvc});
          }
          if (shardName === undefined || shardName === null) {
            console.error('[PostHog] shard_name is undefined/null!', {shardName, envSvc});
          }
          if (appVersion === undefined || appVersion === null) {
            console.error('[PostHog] app_version is undefined/null!', {appVersion, packageJson});
          }
          if (appBuild === undefined || appBuild === null) {
            console.error('[PostHog] app_build is undefined/null!', {appBuild, packageJson});
          }
          if (appPlatform === undefined || appPlatform === null) {
            console.error('[PostHog] app_platform is undefined/null!', {appPlatform});
          }

          // Assicurati che tutti i valori siano definiti
          // Il plugin PostHog accetta 'any' come tipo, quindi manteniamo i tipi originali
          const posthogProps: Record<string, string | number> = {};

          // app_id deve essere un numero valido (non 0) - manteniamo come numero
          if (appId !== undefined && appId !== null && appId !== 0) {
            posthogProps['app_id'] = appId; // Mantieni come numero
          } else {
            console.warn('[PostHog] app_id is invalid, skipping:', appId);
          }

          // shard_name deve essere una stringa non vuota
          if (shardName && typeof shardName === 'string' && shardName.trim() !== '') {
            posthogProps['shard_name'] = shardName;
          } else {
            console.warn('[PostHog] shard_name is invalid, skipping:', shardName);
          }

          // app_version deve essere una stringa non vuota
          if (appVersion && typeof appVersion === 'string' && appVersion.trim() !== '') {
            posthogProps['app_version'] = appVersion;
          } else {
            console.warn('[PostHog] app_version is invalid, skipping:', appVersion);
          }

          // app_build deve essere una stringa non vuota
          if (appBuild && typeof appBuild === 'string' && appBuild.trim() !== '') {
            posthogProps['app_build'] = appBuild;
          } else {
            console.warn('[PostHog] app_build is invalid, skipping:', appBuild);
          }

          // app_platform deve essere una stringa non vuota e valida
          if (
            appPlatform &&
            typeof appPlatform === 'string' &&
            appPlatform.trim() !== '' &&
            appPlatform !== 'unknown'
          ) {
            posthogProps['app_platform'] = appPlatform;
          } else {
            console.warn('[PostHog] app_platform is invalid, skipping:', appPlatform);
          }

          console.log('[PostHog] Registering properties with values:', posthogProps);
          console.log('[PostHog] Number of valid properties:', Object.keys(posthogProps).length);
          // Inizializza e registra le proprietà super di PostHog in un'unica chiamata
          if (Object.keys(posthogProps).length > 0) {
            await posthogSvc.initAndRegister(posthogProps);
          } else {
            console.warn(
              '[PostHog] No valid properties to register, skipping initAndRegister call',
            );
          }

          // Test: cattura un evento di test per verificare che PostHog funzioni
          console.log('[PostHog] Sending test event to verify API calls...');
          try {
            await posthogSvc.capture('app_initialized', {
              test: true,
              timestamp: new Date().toISOString(),
            });
            console.log('[PostHog] Test event sent successfully');
          } catch (error) {
            console.error('[PostHog] Failed to send test event:', error);
          }
        },
      deps: [EnvironmentService, PosthogHybridClient, PosthogService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent, MetaComponent],
})
export class AppModule {
  constructor() {
    // EnvironmentService e PostHog sono inizializzati tramite APP_INITIALIZER
  }
}

registerLocaleData(localeIt);
