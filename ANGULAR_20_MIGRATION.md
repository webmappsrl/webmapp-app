# Migrazione Angular 16→20 e Ionic 6→8

## ✅ Modifiche Completate

### 1. angular.json - browserTarget → buildTarget
- In Angular 17+, `browserTarget` è stato rinominato in `buildTarget` per i builder `dev-server` e `extract-i18n`
- Aggiornati tutti i riferimenti in `angular.json`

### 2. @ngx-translate v17
- Rimossi `USE_DEFAULT_LANG` e `USE_STORE` (deprecati in v17)
- Aggiornato constructor di `LangService` - ora accetta 5 parametri invece di 9
- Rimosso `implements TranslateService` (causava errori con `parser` private)
- Aggiornato `WmTransPipe` - super() ora accetta solo `TranslateService`

### 3. IonSlides → Swiper (Ionic 8)
**In wm-core:**
- `image-detail.component.ts`
- `image-gallery.component.ts`
- `ugc-medias.component.ts`
- `ugc-poi-properties.component.ts`
- `ugc-track-properties.component.ts`

**In app:**
- `modal-success.component.ts`
- `gallery.component.ts`

**Modifiche:**
- Sostituito `ion-slides` con `swiper-container` negli HTML
- Sostituito `ion-slide` con `swiper-slide` negli HTML
- Cambiato `IonSlides` → `ElementRef` nei ViewChild
- Accesso tramite `slider.nativeElement.swiper`
- Import corretto: `swiper/element` (non `swiper/element/bundle`)

### 4. Ionic Modal API - swipeToClose → canDismiss
**File aggiornati:**
- `profile-auth.component.ts` (wm-core)
- `register.component.ts` (wm-core)
- `profile.page.ts`
- `settings.component.ts`
- `btn-track-recording.component.ts`

### 5. Tutti i Pipes e Directives → Standalone
Convertiti **18 pipes/directives** in standalone:
- Tutti i pipes in `wm-core/pipes/` (DistancePipe, DurationPipe, WmTransPipe, etc.)
- BuildSvgDirective
- Aggiornato `WmPipeModule` per importarli invece di dichiararli

### 6. Dev Dependencies Angular 20
- `@angular-eslint/*` → v20.3.0
- `@typescript-eslint/*` → v8.0.0
- `eslint` → v9.0.0
- `@types/node` → v22.0.0
- `@types/jasmine` → v5.1.0
- `jasmine-spec-reporter` → v7.0.0
- `ts-node` → v10.9.0
- Altri aggiornamenti minori

### 7. Custom Elements Schema
- Aggiunto `CUSTOM_ELEMENTS_SCHEMA` a `WmCoreModule`
- Aggiunto `CUSTOM_ELEMENTS_SCHEMA` a `WmUgcMediasModule`

### 8. TypeScript Type Fixes
- `home-hitmap.component.ts` - Aggiunto cast esplicito per `WmFeature<MultiPolygon>[]`

## File Modificati

### Core Configuration
- `core/angular.json`
- `core/package.json`
- `core/src/main.ts`

### wm-core Library
- `localization/lang.service.ts`
- `pipes/wmtrans.pipe.ts`
- `pipes/*.pipe.ts` (18 files → standalone)
- `pipes/pipe.module.ts`
- `pipes/build-svg.directive.ts`
- `profile/profile-auth/profile-auth.component.ts`
- `register/register.component.ts`
- `image-detail/image-detail.component.ts` + HTML
- `image-gallery/image-gallery.component.ts` + HTML
- `ugc-medias/wm-ugc-medias.component.ts` + HTML
- `ugc-medias/wm-ugc-medias.module.ts`
- `ugc-poi-properties/ugc-poi-properties.component.ts`
- `ugc-track-properties/ugc-track-properties.component.ts`
- `wm-core.module.ts`
- `home/home-hitmap/home-hitmap.component.ts`

### App Components
- `components/modal-success/modal-success.component.ts`
- `components/shared/gallery/gallery.component.ts`
- `components/settings/settings.component.ts`
- `pages/profile/profile.page.ts`
- `components/shared/buttons/btn-track-recording/btn-track-recording.component.ts`

## Prossimi Passi

Ora prova a compilare:
```bash
cd /Users/bongiu/Documents/apps/webmapp-app/core
ionic serve
```

Se ci sono ancora errori NG6008 sui componenti, significa che anche i componenti devono essere convertiti in standalone (come consigliato da Angular 19+).
