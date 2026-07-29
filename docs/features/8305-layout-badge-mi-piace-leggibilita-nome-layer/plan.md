> Ticket: oc:8305

# Redesign home-layer camminiditalia e sincronizzazione altezza — webmapp-app Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rimuovere la duplicazione dell'altezza card ora superflua in `favourites-layers.component.scss`, e replicare via CSS puro (solo camminiditalia) il mockup del cliente per la schermata di apertura layer (`wm-home-layer`): foto pulita + fascia bianca con logo, divisore e titolo.

**Architecture:** Task 1 è una semplificazione (rimozione di codice ora ridondante) resa possibile dal Task 1 del plan wm-core (oc:8305): `.wm-box` ha ora un'altezza fissa propria, quindi `favourites-layers.component.scss` non ha più bisogno di darle un containing block. Task 2 usa CSS Grid in `theme/camminiditalia/1.css` per riorganizzare gli elementi esistenti di `home-layer.component.html` (già presenti nel DOM, `ViewEncapsulation.None`) senza toccare il componente condiviso in wm-core.

**Tech Stack:** SCSS (Angular component style), CSS puro (theme override caricato dinamicamente a runtime).

## Global Constraints

- **Dipendenza cross-repo**: il Task 1 di questo piano richiede che il Task 1 del plan wm-core (oc:8305, `layer-box.component.scss`) sia stato applicato con l'altezza fissa **220px**. Se quel valore cambia in fase di verifica visiva, questo piano non ha comunque nulla da aggiornare (la duplicazione viene rimossa, non sostituita con un nuovo numero) — ma verificare che il comportamento visivo resti corretto.
- Nessuna modifica al componente condiviso `home-layer.component.ts`/`.html`/`.scss` in wm-core — il redesign vive solo in `theme/camminiditalia/1.css`.
- Nessuna modifica a `config.json`/`TRANSLATIONS` (il rename "Sentieri"→"Tappe" è fuori scope, gestito lato backend).
- Nessun test e2e esistente coprirà questa schermata per questa istanza — verifica manuale con passi concreti indicati in ogni task.
- Commit convention: `fix(oc:8305): ...`. Nessun commit eseguito automaticamente durante l'esecuzione del piano.
- **Nota operativa per la verifica locale**: `core/src/environments/environment.ts` ha oggi `shardName: 'camminiditaliadev'` (modifica già in corso dell'utente, non committata — non toccarla). L'utente ha creato `core/src/theme/camminiditaliadev/` come copia di lavoro di `core/src/theme/camminiditalia/`, così il link CSS dinamico (`theme/${shardName}/${appId}.css`, `meta.component.ts` in wm-core) risolve correttamente in locale senza nessuna modifica a `environment.ts`. Il Task 2 di questo piano modifica `camminiditaliadev/1.css`, non `camminiditalia/1.css` — l'utente rinominerà la cartella al termine del lavoro.

---

### Task 1: Rimuovere l'altezza hardcoded ora ridondante in `favourites-layers.component.scss`

**Files:**
- Modify: `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.scss`

**Interfaces:**
- Consumes: `.wm-box` con altezza fissa `220px` (wm-core, oc:8305, Task 1 del plan wm-core) — questo task presuppone che quella modifica sia già applicata (submodulo wm-core aggiornato).
- Produces: nessuna interfaccia consumata da altri task.

- [ ] **Step 1: Riprodurre il comportamento attuale (baseline)**

Assicurati che il submodulo `core/src/app/shared/wm-core` punti a un commit con il Task 1 del plan wm-core già applicato (`height: 220px` su `.wm-box`). Da `core/`:

```bash
npm start
```

Vai al tab **Preferiti** → sotto-tab "Layers" (o "Cammini", secondo la label attiva), con almeno un layer salvato nei preferiti. Verifica che le card abbiano già un'altezza corretta e uniforme (dovrebbe già funzionare, perché `.wm-box` ora ha un'altezza fissa propria indipendente dal containing block di `ion-list` — il `height:176px` sull'host `wm-layer-box` in questo file è ora ridondante, non più necessario).

- [ ] **Step 2: Rimuovere l'altezza ridondante**

Apri `core/src/app/pages/favourites/favourites-layers/favourites-layers.component.scss`. Sostituisci:

```scss
:host {
  display: block;

  wm-layer-box {
    // Senza un'altezza esplicita, .wm-box (height:100%) non ha un containing block
    // definito dentro ion-list e collassa all'altezza del solo contenuto in flow —
    // stessa altezza usata dalla griglia Home.
    display: block;
    height: 176px;
  }
```

con:

```scss
:host {
  display: block;

  wm-layer-box {
    // `.wm-box` (wm-core) ha ora un'altezza fissa propria (220px, non più
    // height:100%) — non serve più darle un containing block qui, l'altezza
    // arriva già definita dal componente stesso (oc:8305).
    display: block;
  }
```

(il resto del file, blocco `.webmapp-favourites-nodata`, resta invariato).

- [ ] **Step 3: Verificare che il tab preferiti non regredisca**

Ricarica il tab Preferiti → Layers. Verifica:
- Le card hanno la stessa altezza fissa (220px) vista negli altri contesti (home, ricerca).
- Nessun collasso visivo (card ad altezza 0 o schiacciate) — se questo accade, verificare che il submodulo wm-core sia effettivamente aggiornato al commit del Task 1 del plan wm-core prima di procedere.
- Aggiungi ai preferiti anche il layer con il titolo più lungo ("Magna Via Francigena - Vie Francigene di Sicilia") e verifica l'assenza di sovrapposizione col badge, come già fatto negli altri contesti (Task 1 del plan wm-core).

- [ ] **Step 4: Commit**

```bash
git add core/src/app/pages/favourites/favourites-layers/favourites-layers.component.scss
git commit -m "fix(oc:8305): rimuovere altezza hardcoded ridondante in favourites-layers"
```

---

### Task 2: Redesign `home-layer` per camminiditalia — foto pulita + fascia bianca (logo, divisore, titolo)

**Files:**
- Modify: `core/src/theme/camminiditaliadev/1.css` (copia di lavoro creata dallo sviluppatore, stesso contenuto di `camminiditalia/1.css` — verrà rinominata in `camminiditalia` dopo il merge; **non toccare `camminiditalia/1.css` in questo task**, per evitare divergenza tra le due copie)

**Interfaces:**
- Consumes: classi globali `ViewEncapsulation.None` esposte da wm-core: `.wm-img-image`, `.wm-box-title`, `wm-img.wm-home-layer-logo-overlay`, `.wm-home-layer-favorite` (nessuna dipendenza da altri task di questo piano).
- Produces: nessuna interfaccia consumata da altri task — override CSS isolato, caricato solo per lo shard camminiditalia(dev).

- [ ] **Step 1: Riprodurre il layout attuale (baseline)**

`core/src/environments/environment.ts` ha già `shardName: 'camminiditaliadev'` (modifica in corso dell'utente, non toccarla) — con la cartella `core/src/theme/camminiditaliadev/` già presente (copia di `camminiditalia/`), il link dinamico (`theme/${shardName}/${appId}.css`, `meta.component.ts`) risolve correttamente senza nessuna modifica a `environment.ts`.

Avvia (o riavvia) il dev server da `core/`:

```bash
npm start
```

Apri un layer nella schermata di dettaglio (es. "Cammino Minerario di Santa Barbara", ha un logo impostato). Verifica il comportamento attuale: foto con overlay (titolo in basso a sinistra sulla foto, logo in basso a destra sulla foto, cuoricino in alto a destra sulla foto).

- [ ] **Step 2: Aggiungere l'override CSS Grid**

Apri `core/src/theme/camminiditaliadev/1.css`. Aggiungi in fondo al file:

```css
/* oc:8305 — apertura layer (home-layer): foto pulita in alto + fascia bianca
   sotto con logo + divisore + titolo, invece dell'overlay-su-foto di default.
   Solo camminiditalia (questo file carica solo per questo shard, via
   MetaComponent in wm-core) — nessuna modifica al componente condiviso. */
wm-home-layer > wm-img {
  display: grid !important;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'photo photo'
    'logo title';
}

wm-home-layer > wm-img > .wm-img-image {
  grid-area: photo;
  height: 220px !important;
  border-radius: 15px 15px 0 0 !important;
}

/* Il cuoricino (.wm-home-layer-favorite) resta position:absolute di default
   (regola wm-core non toccata) — non partecipa al grid, resta overlay sulla
   foto in alto a destra, come richiesto dal cliente. */

wm-home-layer > wm-img > wm-img.wm-home-layer-logo-overlay {
  grid-area: logo;
  position: static !important;
  align-self: center;
  margin: 12px !important;
  border-radius: 50% !important;
  background: transparent !important;
  box-shadow: none !important;
}

wm-home-layer > wm-img > .wm-box-title {
  grid-area: title;
  position: relative !important;
  bottom: auto !important;
  align-self: center;
  padding: 16px 16px 16px 12px !important;
  color: #1a1a1a !important;
  background: #fff !important;
  text-shadow: none !important;
  white-space: normal !important;
}

wm-home-layer > wm-img > .wm-box-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background-color: #f5821f;
}
```

- [ ] **Step 3: Verificare visivamente il nuovo layout**

Ricarica la pagina di dettaglio dello stesso layer. Verifica:
- La foto in alto non ha più overlay testuale, altezza 220px, angoli arrotondati solo in alto.
- Sotto la foto c'è una fascia bianca con: logo circolare a sinistra, una linea verticale arancione (divisore), titolo in testo scuro a destra.
- Il cuoricino "mi piace" resta overlay sulla foto in alto a destra (non nella fascia bianca).
- Confronta il colore del divisore (`#f5821f`) e le proporzioni con lo screenshot/mockup fornito dal cliente (allegato al ticket oc:8164) — se il colore reale del brand differisce, aggiorna `background-color` nello Step 2 di conseguenza.
- Apri anche un layer **senza** `logo_image`: verifica che la fascia bianca mostri comunque titolo (e divisore) senza un logo rotto/vuoto — se il layout risulta visivamente sbagliato senza logo, valuta se avvolgere la regola del divisore in `:has()` o accettarlo come caso raro (nessun layer camminiditalia oggi è privo di logo per i cammini principali, verificare comunque).

- [ ] **Step 4: Commit**

```bash
git add core/src/theme/camminiditaliadev/1.css
git commit -m "fix(oc:8305): redesign home-layer camminiditalia via CSS (foto + fascia bianca)"
```

---

## Note per l'esecutore

- Il file toccato in questo ciclo è `core/src/theme/camminiditaliadev/1.css` (copia di lavoro dell'utente). Quando l'utente rinominerà la cartella in `camminiditalia`, questo diff la seguirà automaticamente — non serve nessuna azione aggiuntiva né una seconda modifica su `camminiditalia/1.css`.
- Il colore esatto del divisore (`#f5821f`) è una stima dal mockup PDF fornito dal cliente (screenshot, non palette ufficiale) — da confermare/aggiustare in fase di verifica visiva (Step 3 del Task 2).
- **Sentieri→Tappe**: nessuna azione in questo repo. Segnalare a chi gestisce il `config.json` di camminiditalia (backend/Nova) l'aggiunta dell'override `TRANSLATIONS.it/en/...['Sentiero']='Tappa'` e `['Sentieri']='Tappe'`, seguendo lo stesso pattern già in uso per la chiave `layers`.
- **oc:8164**: una volta completati entrambi i piani (wm-core + webmapp-app) e verificati visivamente, valutare con chi ha aperto il ticket se impostare oc:8164 a "testing" (nota presente nella description originale di oc:8305).
