> Ticket: oc:8406

# Unificare i componenti di dettaglio EcPoi — webmapp-app Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rimuovere il `PoiPropertiesComponent` locale e consumare quello di wm-core via `WmCoreModule`, con pin submodule aggiornato e verifica build production.

**Architecture:** `map.page.html` resta invariato (`<wm-poi-properties>`). Si elimina `PoiPropetiesModule` e la cartella `components/poi-properties/`. Il gitlink `core/src/app/shared/wm-core` punta al commit che contiene la promozione.

**Tech Stack:** Angular 20 / Ionic 8, submodule wm-core.

**Spec:** `docs/features/8406-unificare-componenti-dettaglio-ecpoi/overview.md` (questo repo).

**Piani correlati:** `wm-core/docs/features/8406-.../plan.md` — **eseguire prima** (Tasks 1–4). Fase C wm-webapp: fuori da questo piano (stima inclusa nelle 11h ticket, implementazione dopo merge).

## Global Constraints

- Markup `map.page.html:70` invariato.
- Ordine pin: wm-types → wm-core → questo repo.
- Verifica obbligatoria `ionic build --configuration=production` (o `ng build --configuration=production`) prima di considerare chiuso il pin.
- Nessuna modifica ai tre fratelli UGC/EcTrack nel pannello.
- Commit: `feat(oc:8406): ...` — solo dopo conferma utente.
- Branch già esistente: `feature/oc-8406-unificare-componenti-dettaglio-ecpoi`.

---

### Task 1: Bump pin wm-core (+ wm-types se separato)

**Files:**
- Modify: `core/src/app/shared/wm-core` (gitlink)
- Eventualmente: `core/src/app/shared/wm-types` (gitlink) se tipizzazione in commit dedicato

**Interfaces:**
- Consumes: commit wm-core con `wm-poi-properties` esportato
- Produces: app che risolve `wm-poi-properties` da `WmCoreModule`

- [ ] **Step 1: Checkout/pull del commit feature in submodule wm-core (e wm-types se serve)**

- [ ] **Step 2: `git add` del gitlink e commit pin (dopo conferma)**

```
chore(oc:8406): bump wm-core pin for promoted poi-properties
```

---

### Task 2: Rimuovere il modulo locale

**Files:**
- Delete: `core/src/app/components/poi-properties/` (4 file: `.ts`, `.html`, `.scss`, `.module.ts`)
- Modify: `core/src/app/pages/map/map.module.ts` — togliere import/usage di `PoiPropetiesModule`
- Verify: nessun altro import di `PoiPropetiesModule` (`rg PoiPropetiesModule`)

**Interfaces:**
- Consumes: `WmCoreModule` già importato in `map.module.ts`
- Produces: unico provider di `wm-poi-properties` = wm-core

- [ ] **Step 1: Rimuovere `PoiPropetiesModule` da `map.module.ts`**

- [ ] **Step 2: Cancellare la cartella `poi-properties/`**

- [ ] **Step 3: `rg PoiPropetiesModule` e `rg components/poi-properties` → zero hit applicativi**

- [ ] **Step 4: Commit (dopo conferma)**

```
refactor(oc:8406): remove local poi-properties in favor of wm-core
```

---

### Task 3: Build production + QA manuale

- [ ] **Step 1: Build production**

Da `core/`:

```bash
nvm use 22 && npx ionic build --configuration=production
```

(Se lo shard di lavoro è camminiditalia e serve la variante:  
`npx ng build --configuration=production,camminiditalia` — solo se rilevante; il consumo di `wm-poi-properties` è condiviso.)

Expected: exit 0. Se fallisce per `SharedModule`/export, fix minimo (ri-export o import diretto) documentato in `notes.md`.

- [ ] **Step 2: QA manuale (3 casi)**

1. POI con indirizzo e senza quota → indirizzo sotto **Contatti** (icona + testo); **non** blocco tecnici; «Link utili» assente senza `related_url`  
2. POI con `contact_phone` CSV → N link `tel:`  
3. POI con `config_detail` → accordion presente  

- [ ] **Step 3: Aggiornare Cypress `ec-poi-details.cy.ts` se gli assert su `wm-phone` vanno aggiornati per multi-numero** (solo se falliscono)

- [ ] **Step 4: Commit fix di follow-up se servono (dopo conferma)**

---

### Out of scope di questo piano (fase C — wm-webapp)

Da fare **dopo** il merge di questa PR, ticket/stima già inclusi nelle 11h complessive:

1. Shell `poi-popup`: chrome close/prev/next; branch Ec vs UGC  
2. EcPoi → store + `<wm-poi-properties>` (store-only)  
3. UGC → `<wm-ugc-poi-properties>` preservando edit/delete/reposition  
4. Adozione `wm-related-pois-navigator`  
5. Rimozione derivazione `addr_*` locale a favore di `derivePoiAddress`  
6. QA web Ec / UGC / related / edit  

Piano dettagliato fase C: da scrivere in `wm-webapp/docs/features/8406-.../plan.md` (o ticket figlio) all’avvio di quella sessione.
