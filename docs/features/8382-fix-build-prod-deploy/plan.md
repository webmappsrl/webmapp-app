> Ticket: oc:8382

# Fix build --prod per deploy e deploy-to-web (webmapp-app + wm-webapp) Implementation Plan

> **Per chi esegue questo piano:** REQUIRED SUB-SKILL: usa `superpowers:subagent-driven-development` (consigliato) o `superpowers:executing-plans` per eseguire questo piano task per task. Gli step usano la sintassi checkbox (`- [ ]`) per il tracking.
>
> **⚠️ Nessun commit o branch automatico:** i comandi `git commit`/`git checkout -b` mostrati in ogni task sono istruzioni testuali per lo sviluppatore, NON azioni da eseguire autonomamente. La creazione del branch è già avvenuta in Fase: execution → branch del workflow `wm-plan`; i commit richiedono conferma esplicita dello sviluppatore dopo il review-gate.

**Goal:** Far tornare verde `ionic build --configuration production` in `webmapp-app/core` (oggi 17 errori) e allineare tutti gli script di deploy/preview in `webmapp-app` e `wm-webapp` a usare la build ottimizzata, così che il deploy di produzione spedisca finalmente un bundle AOT/minificato invece di una build di sviluppo.

**Architecture:** Nessun redesign — sono tre interventi indipendenti nello stesso repo (rimozione di codice morto, allineamento di un tipo TypeScript disallineato, aggiornamento di script npm) più un quarto intervento equivalente in un repo separato (`wm-webapp`). Ogni intervento è un commit a sé stante per permettere un rollback mirato.

**Tech Stack:** Angular 20, Ionic 8, TypeScript (strictTemplates), npm scripts, Node 22 (CI) / Node ≥20.19 in locale via `nvm`.

**Spec:**
- `docs/features/8382-fix-build-prod-deploy/overview.md` (repo `webmapp-app`)
- `docs/features/8382-fix-build-prod-deploy/overview.md` (repo `wm-webapp`, sibling su disco, NON submodule)

## Global Constraints

- Node locale di default è v18.13.0, troppo vecchio per Angular CLI (richiede minimo v20.19). Prima di qualsiasi `ng build`/`ionic build` locale: `source ~/.nvm/nvm.sh && nvm use v22.22.0` (stessa major usata in CI).
- `strictTemplates: true` è già impostato in `core/tsconfig.json` — non va toccato, è la causa per cui questi errori esistono solo in `--configuration production` (AOT) e non nella build di dev (`aot: false`).
- Commit convention: `fix(oc:8382): <descrizione>` per ogni commit, in entrambi i repo.
- PR unica per repo (non split in PR multiple), ma un commit per task, per rollback chirurgico.
- Verifica Surge preview è **obbligatoria** prima del merge (non sostituibile da "va bene se compila"): copre esplicitamente home + sezione "downloaded tracks" in `webmapp-app`, e home dello shard camminiditalia in `wm-webapp`.
- Out of scope (non toccare in questo piano): export mancante di `WmCoreModule` da `SharedModule`, shape dati di `getEcTracks()`, budget bundle in `angular.json`, `deploy_prod.yml`/health check.

---

## Task 1: Rimozione di `PoiPage` (dead code) — repo `webmapp-app`

`PoiPage` referenzia un componente mappa (`itinerary-webmapp-map`) che non esiste più da nessuna parte nel repo (API pre-map-core). Verificato: nessuna pagina naviga verso `/poi` (`grep` su `routerLink`/`navigate(['/poi'` → zero risultati), nessuna configurazione di deep link/universal link la referenzia, e l'unico riferimento a `PoiPageModule` in tutto il repo è la sua stessa route in `app-routing.module.ts:17`. È sicuro rimuoverla interamente.

**Files:**
- Modify: `core/src/app/app-routing.module.ts:15-18`
- Delete: `core/src/app/pages/poi/` (intera cartella: `poi.module.ts`, `poi-routing.module.ts`, `poi.page.ts`, `poi.page.html`, `poi.page.scss`, `utils.ts`)

**Interfaces:**
- Nessuna interfaccia prodotta o consumata da altri task — è una rimozione pura, non ci sono altri file nel repo che importano da `./pages/poi`.

- [ ] **Step 1: Rimuovi la route `poi` da `app-routing.module.ts`**

In `core/src/app/app-routing.module.ts`, rimuovi questo blocco (righe 15-18):

```typescript
  {
    path: 'poi',
    loadChildren: () => import('./pages/poi/poi.module').then(m => m.PoiPageModule),
  },
```

- [ ] **Step 2: Elimina l'intera cartella `pages/poi`**

```bash
git rm -r core/src/app/pages/poi
```

- [ ] **Step 3: Verifica che non restino riferimenti a `PoiPage`/`pages/poi`**

```bash
grep -rn "pages/poi\|PoiPageModule\|PoiPage\b" core/src/app --include='*.ts'
```

Expected: nessun output (oltre a quanto già rimosso).

- [ ] **Step 4: Lancia la build di produzione e verifica che gli errori relativi a `poi.page.html` siano spariti**

```bash
source ~/.nvm/nvm.sh && nvm use v22.22.0
cd core && npx ng build --configuration production 2>&1 | grep -c "^Error:"
```

Expected: `3` (restano solo i 3 errori su `downloaded-tracks-box.component.html`/`.ts`, gestiti in Task 2). Se il conteggio è diverso da 3, non procedere: rileggi l'output completo per capire cosa non è stato ripulito.

- [ ] **Step 5: Commit**

```bash
git add core/src/app/app-routing.module.ts
git commit -m "fix(oc:8382): remove dead PoiPage and /poi route"
```

---

## Task 2: Allineamento tipo `IHIT`→`Hit` in `downloaded-tracks-box` — repo `webmapp-app`

`downloaded-tracks-box.component.ts` usa un'interfaccia ambient locale `IHIT` (in `core/src/app/types/elastic.d.ts`) ormai disallineata da `Hit` (`@wm-types/elastic`), che ha aggiunto i campi `properties`/`taxonomyIcons` richiesti dal template `wm-search-box`. `IHIT` (e la sorella `IELASTIC` nello stesso file) non sono usate da nessun'altra parte del repo applicativo (solo citate in un commento JSDoc dentro wm-core, non importate): l'intero file `elastic.d.ts` può essere eliminato.

**Attenzione:** `Hit.id` è `number | string` mentre `IHIT.id` era `number` — il metodo `open(id: number): void`, chiamato dal template con `open(property.id)`, va allargato in coppia o il build torna a fallire.

**Files:**
- Modify: `core/src/app/components/box/downloaded-tracks-box/downloaded-tracks-box.component.ts`
- Delete: `core/src/app/types/elastic.d.ts`

**Interfaces:**
- Consumes: `Hit` da `@wm-types/elastic` (già usata da `SearchBoxComponent extends BaseBoxComponent<Hit>` in `core/src/app/shared/wm-core/projects/wm-core/src/box/search-box/search-box.component.ts`).
- Produces: `DownloadedTracksBoxComponent.open(id: number | string): void` — firma cambiata, nessun altro file nel repo chiama questo metodo (solo il proprio template).

- [ ] **Step 1: Aggiorna `downloaded-tracks-box.component.ts`**

Sostituisci il contenuto del file con:

```typescript
import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {NavController} from '@ionic/angular';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {NavigationExtras} from '@angular/router';
import {getEcTracks} from '@wm-core/utils/localForage';
import {Hit} from '@wm-types/elastic';
@Component({
  standalone: false,
  selector: 'downloaded-tracks-box',
  templateUrl: './downloaded-tracks-box.component.html',
  styleUrls: ['./downloaded-tracks-box.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadedTracksBoxComponent {
  tracks$: Observable<Hit[]>;

  constructor(private _navCtrl: NavController) {
    this.tracks$ = from(getEcTracks()).pipe(
      map(t => t.map(track => track.properties as unknown as Hit)),
    );
  }

  open(id: number | string): void {
    if (id != null) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          track: id,
        },
        queryParamsHandling: 'merge',
      };
      this._navCtrl.navigateForward('map', navigationExtras);
    }
  }
}
```

- [ ] **Step 2: Elimina il file di tipi locale ormai inutilizzato**

```bash
git rm core/src/app/types/elastic.d.ts
```

- [ ] **Step 3: Verifica che nessun altro file usasse `IHIT`/`IELASTIC` da questo path**

```bash
grep -rn "IHIT\|IELASTIC" core/src/app --include='*.ts' | grep -v "shared/map-core\|shared/wm-core"
```

Expected: nessun output (i due `IHIT` che restano — in `map-core/src/types/layer.ts` e `wm-core/.../wm-get-data.pipe.ts` — sono interfacce omonime ma indipendenti, dentro submodule, fuori scope).

- [ ] **Step 4: Lancia la build di produzione e verifica 0 errori**

```bash
source ~/.nvm/nvm.sh && nvm use v22.22.0
cd core && npx ng build --configuration production 2>&1 | grep -c "^Error:"
```

Expected: `0`.

- [ ] **Step 5: Commit**

```bash
git add core/src/app/components/box/downloaded-tracks-box/downloaded-tracks-box.component.ts
git commit -m "fix(oc:8382): align downloaded-tracks-box to shared Hit type"
```

---

## Task 2b (aggiunto in esecuzione, non previsto dal piano originale): Fix collisione `domhandler` — repo `webmapp-app`

Con i 17 errori TS risolti (Task 1+2), `ionic build --configuration production` falliva comunque in una fase successiva ("Generating index html") con `document.documentElement?.setAttribute is not a function`. Causa verificata con repro isolato: il progetto aveva **due copie fisiche incompatibili di `domhandler`** nel `node_modules` — `4.3.1` (portata da `@capacitor/assets` → `node-html-parser@5.4.2`, dependency inutilizzata nel codice applicativo/gulpfile di questo progetto) e `5.0.3` (richiesta da `beasties`/`htmlparser2`, usati da `@angular/build` per l'inlining del CSS critico in `index.html`). npm non poteva deduplicarle (major incompatibili), e questo causava un mismatch di prototipo tra l'elemento `<html>` parsato e la classe `Element` che `beasties` tenta di estendere con `setAttribute`.

Fix: forzare (via `overrides` in `package.json`, scoped solo sotto `@capacitor/assets`) `node-html-parser` a una versione più recente (`^9.0.1`) che dipende da `css-select@^5.1.0` → `domhandler@^5.0.2`, compatibile con la versione richiesta da `beasties` — permettendo a npm di dedupllicare tutto in un'unica copia di `domhandler@5.0.3`. Verificato che `@capacitor/assets` non è mai invocato da `gulpfile.js` in questo progetto (nessun `require`/comando CLI trovato) e che l'unico uso di `node-html-parser` al suo interno (`platforms/pwa/index.js`) si limita ad API stabili (`parse`, `querySelector`, `querySelectorAll`) — rischio di regressione pressoché nullo.

**Files:**
- Modify: `core/package.json` (aggiunta campo `overrides`)
- Modify: `core/package-lock.json` (rigenerato da `npm install`)

**Interfaces:** nessuna — fix di risoluzione dipendenze, non di codice applicativo.

- [ ] **Step 1: Aggiungi il campo `overrides` a `core/package.json`**

```json
"overrides": {
  "@capacitor/assets": {
    "node-html-parser": "^9.0.1"
  }
}
```

- [ ] **Step 2: Reinstalla le dipendenze**

```bash
source ~/.nvm/nvm.sh && nvm use v22.22.0
cd core && npm install
```

- [ ] **Step 3: Verifica che `domhandler` sia ora unificato in una sola copia**

```bash
npm ls domhandler
```

Expected: un solo `domhandler@5.0.3`, nessuna riga senza `deduped` oltre alla prima occorrenza.

- [ ] **Step 4: Rilancia la build di produzione e verifica che completi con successo, con il CSS critico effettivamente inlineato**

```bash
source ~/.nvm/nvm.sh && nvm use v22.22.0
cd core && npx ng build --configuration production
echo "EXIT_CODE=$?"
grep -c "<style" www/index.html
```

Expected: `EXIT_CODE=0`, `grep -c "<style"` ≥ `1`.

- [ ] **Step 5: Commit**

```bash
git add core/package.json core/package-lock.json
git commit -m "fix(oc:8382): dedupe domhandler to unblock production build"
```

---

## Task 3: Script `deploy-to-web*` con build di produzione — repo `webmapp-app`

Con la build `--configuration production` ora pulita (Task 1+2), gli script di deploy possono passare a usarla. `deploy_prod.yml` chiama `npm run deploy-to-web`, quindi questo è il cambio che chiude effettivamente il ticket per `webmapp-app`.

**Files:**
- Modify: `core/package.json`

**Interfaces:**
- Nessuna — modifica di configurazione, non di codice applicativo.

- [ ] **Step 1: Aggiorna gli script in `core/package.json`**

Sostituisci le quattro righe `scripts` esistenti con:

```json
"deploy-to-web": "ionic build --configuration production && rsync -av --exclude 'assets' ./www/* server:/var/www/html/mobile.webmapp.it/",
"deploy-cai-to-web": "ionic build --configuration production && scp -r ./www/* cai.osm2cai:/var/www/html/mobile/",
"deploy-to-web-verbose": "ionic build --configuration production && scp -r ./www/* server:/var/www/html/mobile.webmapp.it/",
"deploy-to-web-assets": "ionic build --configuration production &&  scp -r ./www/assets/* server:/var/www/html/mobile.webmapp.it/assets/",
```

Nota: mantieni invariata la formattazione/ordine già presente nel file (non riordinare le altre chiavi di `scripts`), sostituisci solo il comando `ionic build` con `ionic build --configuration production` in queste quattro righe.

- [ ] **Step 2: Verifica che il comando effettivo di build usato in CI funzioni end-to-end**

```bash
source ~/.nvm/nvm.sh && nvm use v22.22.0
cd core && npx ionic build --configuration production
echo "EXIT_CODE=$?"
```

Expected: `EXIT_CODE=0`, cartella `core/www/` rigenerata.

- [ ] **Step 3: Commit**

```bash
git add core/package.json
git commit -m "fix(oc:8382): use production build configuration in deploy-to-web scripts"
```

- [ ] **Step 4 (gate manuale, non automatizzabile): Surge preview obbligatoria**

Prima di aprire/mergiare la PR, verifica su una preview Surge (generata automaticamente dalla PR, workflow `preview.yml`) che:
- La home carichi correttamente
- La sezione "downloaded tracks" (box `downloaded-tracks-box`, quella toccata dal Task 2) mostri i track scaricati senza errori in console
- Non ci siano errori JS in console riconducibili ad AOT (es. `NG0304`, componenti "not a known element" sfuggiti alla compilazione ma rotti a runtime)

Questo step non produce un commit: è una condizione da soddisfare prima di procedere al merge, da annotare come fatta in `notes.md`.

---

## Task 4: Script `surge-camminiditalia` con `--prod` — repo `wm-webapp`

`wm-webapp` builda già `--prod` senza errori (verificato: 0 errori, solo warning non bloccanti su bundle budget e Sass `@import` deprecato). L'unico script rimasto indietro è `surge-camminiditalia`, l'unico a non usare `--prod` tra tutti gli script `deploy`/`surge-*` del repo.

**Files:**
- Modify: `/Users/peco/Documents/Apps/wm-webapp/package.json` (repo separato, non submodule di `webmapp-app`)

**Interfaces:**
- Nessuna — modifica di configurazione in un repo indipendente.

- [ ] **Step 1: Aggiorna lo script `surge-camminiditalia`**

In `package.json`, sostituisci:

```json
"surge-camminiditalia": "ionic build && surge --project ./www --domain http://1.camminiditalia.surge.sh/",
```

con:

```json
"surge-camminiditalia": "ionic build --prod && surge --project ./www --domain http://1.camminiditalia.surge.sh/",
```

- [ ] **Step 2: Verifica che la build `--prod` completi senza errori (già verificato in fase di planning, ripeti per conferma sullo stato corrente del branch)**

```bash
source ~/.nvm/nvm.sh && nvm use v22.22.0
cd /Users/peco/Documents/Apps/wm-webapp && npx ng build --configuration production 2>&1 | grep -c "^Error:"
```

Expected: `0`.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "fix(oc:8382): align surge-camminiditalia script to production build"
```

- [ ] **Step 4 (gate manuale, non automatizzabile): Surge preview obbligatoria sullo shard camminiditalia**

Esegui `npm run surge-camminiditalia` (o l'equivalente preview PR-based se configurato) e verifica manualmente la home dello shard camminiditalia — è la prima volta che questo shard viene servito da una build `--prod`, senza precedenti noti da cui stimare eventuali differenze runtime AOT vs JIT. Annota l'esito in `notes.md`.

---

## Self-Review

**Spec coverage** (confronto con i Requisiti di `overview.md`, repo `webmapp-app`):
- ✅ `ionic build --configuration production` senza errori → Task 1 (Step 4) + Task 2 (Step 4)
- ✅ Rimozione completa `PoiPage`/route → Task 1
- ✅ `downloaded-tracks-box` su `Hit` → Task 2
- ✅ `open(id)` aggiornato in coppia col cambio tipo → Task 2, Step 1
- ✅ Script `deploy-to-web*` con `--configuration production` → Task 3
- ✅ Verifica Surge preview obbligatoria (home + downloaded-tracks) → Task 3, Step 4
- ✅ `wm-webapp`: `surge-camminiditalia` allineato + Surge preview camminiditalia → Task 4

**Placeholder scan:** nessun "TBD"/"implement later" nei task sopra; ogni step ha comando o codice completo, nessun rimando a "come sopra".

**Type consistency:** `Hit` importato da `@wm-types/elastic` in Task 2 è lo stesso tipo già consumato da `SearchBoxComponent<Hit>` (verificato nel codice esistente) — nessuna divergenza di nome/import tra i task.
