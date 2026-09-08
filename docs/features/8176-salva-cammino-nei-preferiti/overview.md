> Ticket: oc:8176

# Salva cammino nei preferiti — webmapp-app

## Cosa cambia

**Scoperta chiave emersa durante l'analisi (corregge lo scope originale del ticket):** la sezione "I miei preferiti" per le tracce (`EcTrack`) **esiste già in produzione** — un tab "Favourites" nella tab bar principale (`pages/tabs/tabs.page.html`, icona cuore, visibile quando `confAUTHEnable && isLogged`), una pagina `favourites.page.ts` funzionante (chiama gli stessi endpoint `EcTrackController` di wm-package), e un cuoricino già attivo su `map-track-card.component`. Il ticket originale la elencava erroneamente come "out of scope / UI non implementata".

Questa feature estende `FavouritesPage` da lista singola (solo tracce) a **vista a due tab**: "Tracce" (comportamento invariato, sempre visibile secondo la condizione esistente) e "Cammini" (nuovo, visibile **solo se `OPTIONS.showFavorites=true`**). Il tab bar principale e la sua condizione di visibilità (`confAUTHEnable && isLogged`) restano invariati — `showFavorites` non tocca la visibilità dell'intero tab "Favourites", solo del sotto-tab "Cammini" al suo interno.

Il tab "Cammini" riusa il componente `wm-layer-box` (wm-core) per il rendering, popolato dalla stessa chiamata `GET /api/layer/favorite/list` (wm-package) usata dal cuoricino in wm-core — stesso servizio condiviso, nessuna duplicazione di cache.

**UX (da `ui-ux-pro-max`):** per il selettore tra i due tab dentro `FavouritesPage`, usare `ion-segment` (cambio di vista in-page) e non `ion-tabs` annidati — i tab Ionic sono pensati per route indipendenti con propria history; usarli qui romperebbe l'aspettativa dell'utente sul comportamento del tasto "indietro" (la navigazione a "Tracce"/"Cammini" non deve generare voci nella cronologia).

## Perché

Il cliente vuole salvare i cammini di interesse per ritrovarli facilmente — la stessa capacità già disponibile oggi per le tracce, estesa ai layer. Vedi overview `wm-core` e `wm-package` per i dettagli tecnici cross-repo.

## Requisiti

- [ ] `FavouritesPage` ristrutturata con `ion-segment` a due voci: "Tracce" (contenuto/logica esistente invariata) e "Cammini" (nuovo)
- [ ] Tab "Cammini" visibile solo se `OPTIONS.showFavorites=true` (letto da `@wm-core/store/conf/conf.selector.ts`, nuovo selettore `confOPTIONSShowFavorites`)
- [ ] Tab "Cammini" popolato riusando `wm-layer-box` (wm-core) e il servizio condiviso di cache preferiti layer (vedi overview wm-core)
- [ ] Tab "Cammini": stato vuoto (stesso pattern `pages.favourites.nodata` del tab Tracce) e stato di errore su fetch fallita
- [ ] i18n: nuove chiavi per le label dei due segmenti, in tutte le 7 lingue (default italiano), in `core/src/assets/i18n/*`

## Rischi

- **Il ticket originale descriveva erroneamente i preferiti-tracce come "non implementati"**: qualunque stima o comunicazione col cliente basata sul testo originale del ticket va aggiornata — il lavoro reale è "estendere a due tab", non "costruire la sezione preferiti da zero"
- Vedi rischio di cache disallineata cuoricino/lista e assenza di paginazione in overview wm-core

## Out of scope

- Redesign della UX esistente delle tracce preferite (card, comportamento tab "Tracce")
- Preferiti su `EcPoi`

## Moduli toccati

- `core/src/app/pages/favourites/favourites.page.{ts,html,scss}`
- `core/src/app/pages/favourites/favourites.module.ts` / `favourites-routing.module.ts` (se serve nuovo import di `wm-layer-box`)
- `core/src/assets/i18n/{it,en,de,es,fr,pr,sq}.ts`
