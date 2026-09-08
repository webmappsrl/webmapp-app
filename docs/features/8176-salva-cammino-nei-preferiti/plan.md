# Salva cammino nei preferiti — webmapp-app Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> Ticket: oc:8176

**Goal:** Trasformare `FavouritesPage` (oggi solo tracce) in una vista a due segmenti — "Tracce" (invariato) e "Cammini" (nuovo, condizionato a `OPTIONS.show_favorites`) — riusando `wm-layer-box` e `LayerFavoriteService` da wm-core.

**Architecture:** `ion-segment` in-page (non `ion-tabs` annidati, per non introdurre voci di history indesiderate). Il segmento "Tracce" mantiene il comportamento e i binding esistenti immutati. Il segmento "Cammini" chiama `LayerFavoriteService.getFavorites()` (wm-core, import diretto via `@wm-core/services/layer-favorite.service`, stesso pattern già in uso per `isLogged` da `auth.selectors`) e si sottoscrive a `favorites$` per restare reattivo se un preferito viene rimosso dal cuoricino dentro la lista stessa.

**Tech Stack:** Angular 20 (standalone: false), Ionic 8 (`ion-segment`), Karma/Jasmine.

## Global Constraints

- Il comportamento e i binding del segmento "Tracce" (paginazione, `remove()`, `nodata`) restano **invariati** — nessuna regressione
- Il segmento "Cammini" è visibile solo se `confOPTIONSShowFavorites` (selettore da `@wm-core/store/conf/conf.selector`, introdotto nel piano wm-core) è `true`
- `ILAYER.id` è `string` — nessuna coercizione numerica nei confronti
- Nessuna migration, nessun nuovo endpoint in questo repo — tutta la logica di rete/cache vive in `LayerFavoriteService` (wm-core)

---

### Task 1: `ion-segment` Tracce/Cammini in `FavouritesPage`

**Files:**
- Modify: `core/src/app/pages/favourites/favourites.page.ts`
- Modify: `core/src/app/pages/favourites/favourites.page.html`
- Modify: `core/src/app/pages/favourites/favourites.page.scss`
- Test: `core/src/app/pages/favourites/favourites.page.spec.ts` (nuovo — solo la logica del segmento, non l'intero componente)

**Interfaces:**
- Consumes: `confOPTIONSShowFavorites` (da `@wm-core/store/conf/conf.selector`, wm-core Task 1)
- Produces: `selectedSegment: 'tracks' | 'layers'` (property pubblica), consumato dal Task 2 per condizionare il caricamento dei preferiti layer

- [ ] **Step 1: Scrivi il test per il default del segmento e la visibilità condizionata**

```typescript
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {GeohubService} from 'src/app/services/geohub.service';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

import {FavouritesPage} from './favourites.page';

describe('FavouritesPage — segmento Tracce/Cammini (oc:8176)', () => {
  function createPage(showFavorites: boolean): FavouritesPage {
    const storeSpy = jasmine.createSpyObj<Store>('Store', ['select']);
    storeSpy.select.and.returnValue(of(showFavorites));
    const geoHubSvcSpy = jasmine.createSpyObj<GeohubService>('GeohubService', [
      'getFavouriteTracks',
      'setFavouriteTrack',
    ]);
    geoHubSvcSpy.getFavouriteTracks.and.resolveTo([]);
    const urlHandlerSvcSpy = jasmine.createSpyObj<UrlHandlerService>('UrlHandlerService', [
      'changeURL',
    ]);

    return new FavouritesPage(geoHubSvcSpy, storeSpy, urlHandlerSvcSpy);
  }

  it('parte con il segmento "tracks" selezionato', () => {
    const page = createPage(true);
    expect(page.selectedSegment).toBe('tracks');
  });

  it('espone showLayersSegment$ come true quando show_favorites è true', done => {
    const page = createPage(true);
    page.showLayersSegment$.subscribe(v => {
      expect(v).toBe(true);
      done();
    });
  });

  it('espone showLayersSegment$ come false quando show_favorites è false', done => {
    const page = createPage(false);
    page.showLayersSegment$.subscribe(v => {
      expect(v).toBe(false);
      done();
    });
  });
});
```

- [ ] **Step 2: Esegui il test per verificare che fallisca**

Run: `ng test --include='**/favourites.page.spec.ts'`
Expected: FAIL — `selectedSegment`/`showLayersSegment$` non esistono sulla classe

- [ ] **Step 3: Aggiorna `favourites.page.ts`**

```typescript
import {Component, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from '@ionic/angular';
import {GeohubService} from 'src/app/services/geohub.service';
import {NavigationExtras, Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {confOPTIONSShowFavorites} from '@wm-core/store/conf/conf.selector';
import {Feature, LineString} from 'geojson';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';

@Component({
  standalone: false,
  selector: 'webmapp-favourites',
  templateUrl: './favourites.page.html',
  styleUrls: ['./favourites.page.scss'],
})
export class FavouritesPage implements OnInit {
  private page: number = 0;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  isLogged$: Observable<boolean> = this._store.pipe(select(isLogged));
  showLayersSegment$: Observable<boolean> = this._store.select(confOPTIONSShowFavorites);
  selectedSegment: 'tracks' | 'layers' = 'tracks';
  tracks$: BehaviorSubject<Feature<LineString>[]> = new BehaviorSubject<Feature<LineString>[]>(
    null,
  );

  constructor(
    private _geoHubService: GeohubService,
    private _store: Store,
    private _urlHandlerSvc: UrlHandlerService,
  ) {}

  async ngOnInit() {
    this.doRefresh(null);
  }

  onSegmentChange(segment: 'tracks' | 'layers'): void {
    this.selectedSegment = segment;
  }

  async doRefresh(event) {
    this.page = 0;
    this.tracks$.next(await this._geoHubService.getFavouriteTracks());
    if (event) {
      event.target.complete();
    }
  }

  async ionViewDidEnter() {
    this.doRefresh(null);
  }

  async loadData(event) {
    this.tracks$.next([
      ...this.tracks$.value,
      ...(await this._geoHubService.getFavouriteTracks(++this.page)),
    ]);

    event.target.complete();
  }

  open(track: Feature<LineString>) {
    const clickedFeatureId = track.properties.id ?? null;
    this._urlHandlerSvc.changeURL('map', {track: clickedFeatureId});
  }

  async remove(track: Feature<LineString>) {
    await this._geoHubService.setFavouriteTrack(track.properties.id, false);
    const idx = this.tracks$.value.findIndex(x => x.properties.id == track.properties.id);
    const currentTracks = this.tracks$.value;
    currentTracks.splice(idx, 1);
    this.tracks$.next([...currentTracks]);
  }
}
```

(Unico cambiamento rispetto all'originale: aggiunti `showLayersSegment$`, `selectedSegment`, `onSegmentChange()` e l'import di `confOPTIONSShowFavorites` — tutto il resto della classe è invariato.)

- [ ] **Step 4: Aggiorna `favourites.page.html`**

```html
<ion-header>
  <ion-toolbar class="webmapp-favourites-header-toolbar-header">
    <ion-title mode="md" class="webmapp-favourites-header-toolbar-title">
      {{'pages.favourites.title' | wmtrans}}
    </ion-title>
  </ion-toolbar>
  <ion-toolbar *ngIf="showLayersSegment$|async">
    <ion-segment [value]="selectedSegment" (ionChange)="onSegmentChange($event.detail.value)">
      <ion-segment-button value="tracks">
        <ion-label>{{'pages.favourites.tabs.tracks' | wmtrans}}</ion-label>
      </ion-segment-button>
      <ion-segment-button value="layers">
        <ion-label>{{'pages.favourites.tabs.layers' | wmtrans}}</ion-label>
      </ion-segment-button>
    </ion-segment>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)" *ngIf="selectedSegment === 'tracks'">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>
  <ng-container *ngIf="isLogged$|async;else nologged">
    <ng-container *ngIf="selectedSegment === 'tracks'">
      <ng-container *ngIf="tracks$|async as tracks">
        <ion-label class="webmapp-favourites-nodata" *ngIf="!tracks || !tracks.length"
          >{{'pages.favourites.nodata' | wmtrans}}</ion-label
        >
        <ion-list>
          <webmapp-card-track
            *ngFor="let track of tracks"
            [track]="track"
            (open)="open($event)"
            (remove)="remove($event)"
          >
          </webmapp-card-track> </ion-list
      ></ng-container>
    </ng-container>

    <webmapp-favourites-layers *ngIf="selectedSegment === 'layers'"></webmapp-favourites-layers>
  </ng-container>
  <ng-template #nologged>
    <ion-label class="webmapp-favourites-nodata">
      {{'non sei loggato. puoi loggare da'|wmtrans}}
      <ion-button [routerLink]="['/profile']">{{'qui'|wmtrans}}</ion-button></ion-label
    >
  </ng-template>

  <ion-infinite-scroll
    *ngIf="selectedSegment === 'tracks'"
    threshold="100px"
    (ionInfinite)="loadData($event)"
  >
    <ion-infinite-scroll-content loadingSpinner="bubbles" loadingText="Loading more data...">
    </ion-infinite-scroll-content>
  </ion-infinite-scroll>
</ion-content>
```

`webmapp-favourites-layers` è un nuovo componente creato nel Task 2 — dichiaralo qui come riferimento anticipato, il template non compila finché il Task 2 non lo crea (atteso: questo task da solo lascia un errore di compilazione sul tag sconosciuto se eseguito isolatamente in produzione; è comunque corretto seguire l'ordine TDD step-by-step, il Task 2 lo risolve subito dopo).

- [ ] **Step 5: Aggiungi lo stile del segmento**

In `favourites.page.scss`, aggiungi in coda:

```scss
ion-segment {
  --background: transparent;
}
```

- [ ] **Step 6: Esegui il test per verificare che passi**

Run: `ng test --include='**/favourites.page.spec.ts'`
Expected: PASS (3 test)

- [ ] **Step 7: Aggiungi le chiavi i18n**

In `core/src/assets/i18n/it.ts`, dentro `'pages': {'favourites': {...}}`, aggiungi:

```typescript
    'favourites': {
      'nodata':
        "Non ci sono tracce preferite, clicca sull'icona cuore di una traccia per aggiungerla a questa lista",
      'title': 'Preferiti',
      'tabs': {
        'tracks': 'Tracce',
        'layers': 'Cammini',
      },
      'nodataLayers':
        "Non ci sono cammini preferiti, clicca sull'icona cuore di un cammino per aggiungerlo a questa lista",
    },
```

Ripeti la stessa struttura chiave (`tabs.tracks`, `tabs.layers`, `nodataLayers`) nei restanti 6 file (`en.ts`, `de.ts`, `es.ts`, `fr.ts`, `pr.ts`, `sq.ts`), con i valori tradotti nella lingua corrispondente (es. `en.ts`: `'tracks': 'Tracks', 'layers': 'Paths'`).

- [ ] **Step 8: Commit**

```bash
git add core/src/app/pages/favourites/favourites.page.ts core/src/app/pages/favourites/favourites.page.html core/src/app/pages/favourites/favourites.page.scss core/src/app/pages/favourites/favourites.page.spec.ts core/src/assets/i18n/
git commit -m "feat(oc:8176): add tracks/layers segment scaffold to FavouritesPage"
```

---

### Task 2: Componente `webmapp-favourites-layers`

**Files:**
- Create: `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.ts`
- Create: `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.html`
- Create: `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.scss`
- Modify: `core/src/app/pages/favourites/favourites.module.ts` (dichiarazione componente + import `BoxModule`)
- Test: `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.spec.ts` (nuovo)

**Interfaces:**
- Consumes: `LayerFavoriteService` (wm-core Task 2: `.getFavorites()`, `.favorites$`), `ILAYER`/`ILAYERBOX` (`@wm-core/types/config`)
- Produces: `<webmapp-favourites-layers>`, usato dal Task 1 di questo repo

- [ ] **Step 1: Scrivi i test per stato caricamento/vuoto/popolato/errore**

```typescript
import {LayerFavoriteService} from '@wm-core/services/layer-favorite.service';
import {ILAYER} from '@wm-core/types/config';
import {of, throwError} from 'rxjs';

import {FavouritesLayersComponent} from './favourites-layers.component';

describe('FavouritesLayersComponent (oc:8176)', () => {
  const fakeLayer: ILAYER = {id: '3', title: 'Cammino preferito'} as any;

  function createComponent(
    favorites: ILAYER[],
    getFavoritesError = false,
  ): FavouritesLayersComponent {
    const favoriteSvcSpy = jasmine.createSpyObj<LayerFavoriteService>('LayerFavoriteService', [
      'getFavorites',
    ]);
    (favoriteSvcSpy as any).favorites$ = of(favorites);
    if (getFavoritesError) {
      favoriteSvcSpy.getFavorites.and.rejectWith(new Error('network error'));
    } else {
      favoriteSvcSpy.getFavorites.and.resolveTo(favorites);
    }

    return new FavouritesLayersComponent(favoriteSvcSpy);
  }

  it('espone loadError = true se getFavorites fallisce', async () => {
    const component = createComponent([], true);
    await component.ngOnInit();
    expect(component.loadError).toBeTrue();
  });

  it('espone loadError = false e la lista se getFavorites va a buon fine', async () => {
    const component = createComponent([fakeLayer]);
    await component.ngOnInit();
    expect(component.loadError).toBeFalse();

    let layers: ILAYER[];
    component.layers$.subscribe(v => (layers = v));
    expect(layers).toEqual([fakeLayer]);
  });

  it('avvolge ogni layer in un box di tipo layer per wm-layer-box', async () => {
    const component = createComponent([fakeLayer]);
    await component.ngOnInit();

    let boxes: any[];
    component.layerBoxes$.subscribe(v => (boxes = v));
    expect(boxes).toEqual([{box_type: 'layer', title: fakeLayer.title, layer: fakeLayer}]);
  });
});
```

- [ ] **Step 2: Esegui i test per verificare che falliscano**

Run: `ng test --include='**/favourites-layers.component.spec.ts'`
Expected: FAIL — modulo `./favourites-layers.component` non trovato

- [ ] **Step 3: Crea il componente**

```typescript
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {LayerFavoriteService} from '@wm-core/services/layer-favorite.service';
import {ILAYER, ILAYERBOX} from '@wm-core/types/config';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'webmapp-favourites-layers',
  templateUrl: './favourites-layers.component.html',
  styleUrls: ['./favourites-layers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesLayersComponent implements OnInit {
  layers$: Observable<ILAYER[]> = this._layerFavoriteSvc.favorites$;
  layerBoxes$: Observable<ILAYERBOX[]> = this.layers$.pipe(
    map(layers => layers.map(layer => ({box_type: 'layer' as const, title: layer.title, layer}))),
  );
  loadError = false;
  loading = true;

  constructor(private _layerFavoriteSvc: LayerFavoriteService) {}

  async ngOnInit(): Promise<void> {
    try {
      await this._layerFavoriteSvc.getFavorites();
      this.loadError = false;
    } catch {
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }
}
```

- [ ] **Step 4: Crea il template**

```html
<ion-label class="webmapp-favourites-nodata" *ngIf="loadError">
  {{'Impossibile caricare i cammini preferiti, riprova' | wmtrans}}
</ion-label>

<ng-container *ngIf="!loadError">
  <ng-container *ngIf="layerBoxes$|async as boxes">
    <ion-label class="webmapp-favourites-nodata" *ngIf="!loading && !boxes.length">
      {{'pages.favourites.nodataLayers' | wmtrans}}
    </ion-label>
    <ion-list>
      <wm-layer-box *ngFor="let box of boxes" [data]="box"></wm-layer-box>
    </ion-list>
  </ng-container>
</ng-container>
```

- [ ] **Step 5: Crea lo stile (vuoto, eredita da `favourites.page.scss`)**

```scss
:host {
  display: block;
}
```

- [ ] **Step 6: Registra il componente nel modulo**

In `core/src/app/pages/favourites/favourites.module.ts`:

```typescript
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {FavouritesPageRoutingModule} from './favourites-routing.module';

import {FavouritesPage} from './favourites.page';
import {FavouritesLayersComponent} from './favourites-layers/favourites-layers.component';
import {CardsModule} from 'src/app/components/cards/cards.module';
import {WmPipeModule} from '@wm-core/pipes/pipe.module';
import {BoxModule} from 'src/app/components/box/box.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavouritesPageRoutingModule,
    WmPipeModule,
    CardsModule,
    BoxModule,
  ],
  declarations: [FavouritesPage, FavouritesLayersComponent],
})
export class FavouritesPageModule {}
```

- [ ] **Step 7: Esegui i test per verificare che passino**

Run: `ng test --include='**/favourites-layers.component.spec.ts'`
Expected: PASS (3 test)

- [ ] **Step 8: Esegui anche il test del Task 1 per verificare che l'intera pagina compili ora**

Run: `ng test --include='**/favourites.page.spec.ts'`
Expected: PASS (3 test, invariato)

- [ ] **Step 9: Aggiungi la chiave i18n per l'errore di caricamento**

In tutti e 7 i file `core/src/assets/i18n/{it,en,de,es,fr,pr,sq}.ts`, aggiungi (a livello root, stesso pattern chiave-italiana delle altre chiavi in questi file):

```typescript
  'Impossibile caricare i cammini preferiti, riprova': 'Impossibile caricare i cammini preferiti, riprova', // it — valore tradotto per le altre lingue
```

- [ ] **Step 10: Commit**

```bash
git add core/src/app/pages/favourites/ core/src/assets/i18n/
git commit -m "feat(oc:8176): add favourites-layers component wired to LayerFavoriteService"
```
