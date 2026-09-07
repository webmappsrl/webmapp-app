> Ticket: oc:8465

# Preferiti: aprire di default il tab Cammini (layer), non Sentieri

## Cosa cambia

Entrando nella sezione Preferiti, il tab attivo di default diventa "Cammini" (layer) invece di "Sentieri" (tracce) — ma solo per gli shard che hanno il tab Cammini abilitato (`confOPTIONSShowFavorites` / `showFavorites` a `true`). Se il flag è `false` (segmento nascosto), il default resta `tracks`, perché il segmento di switch non è renderizzato e non ci sarebbe modo di tornare indietro se il default fosse `layers`.

Nessuna modifica di layout, struttura DOM o stile: cambia solo lo stato iniziale (`selectedSegment`) del componente `FavouritesPage`, già esistente.

## Perché

Segnalato due volte dal cliente (Davide Nanna, call del 03/09/2026): la feature "salva cammino nei preferiti" (oc:8176) ha introdotto il tab Cammini, ma l'utente entra sempre sul tab Sentieri. La prima segnalazione era stata archiviata come possibile bug isolato; la seconda conferma che è un comportamento sistematico non voluto.

## Requisiti

- [ ] `FavouritesPage.selectedSegment` parte a `'layers'` quando `confOPTIONSShowFavorites` (via `showLayersSegment$`) risolve `true`
- [ ] `FavouritesPage.selectedSegment` resta `'tracks'` quando `showLayersSegment$` risolve `false` (nessuna regressione per shard con il tab Cammini disabilitato)
- [ ] Il cambio si applica a tutti gli shard (nessun `fileReplacements`, nessuna eccezione per camminiditalia): `favourites.page.ts` è codice condiviso, coerente col precedente di oc:8458 ("comportamento condiviso da tutti gli shard, nessuna eccezione" pur nascendo su branch RDO camminiditalia)
- [ ] Lo unit test esistente `favourites.page.spec.ts` (oc:8176) viene aggiornato per riflettere il nuovo default, con un caso aggiuntivo per il guard `showFavorites=false`
- [ ] Il test e2e esistente `favourites.cy.ts` continua a passare (verificato: non fa assunzioni sul tab di default, ma va rieseguito per conferma)

## Rischi

- **Race condition su cold start (rischio critico, mitigato)**: `confOPTIONSShowFavorites` legge `state.showFavorites ?? false` da uno store popolato da un effect asincrono (fetch di `config.json`). Se il default fosse risolto con `take(1)` sulla primissima emissione grezza, in caso di rete lenta/deep link/PWA appena installata quella prima emissione sarebbe il fallback `false`, non il valore reale — e siccome le pagine sotto `ion-tabs` non vengono ricreate, il default sbagliato resterebbe "congelato" per l'intera sessione, **ricreando lo stesso bug segnalato dal cliente** in una forma più subdola (solo su rete lenta, difficile da riprodurre in QA "a freddo"). Mitigazione decisa: il default va risolto solo dopo che lo store segnala la config effettivamente caricata (selettore/flag esistente da individuare in Fase: write-plan, pattern già usato altrove nel repo per lo stesso tipo di attesa, es. `loadConfSuccess` in oc:7643), non sulla prima emissione grezza. Questo chiude anche il rischio collaterale di sottoscrizioni che sovrascrivono una scelta manuale dell'utente dopo il render iniziale (risolto lo stesso `take(1)`, ma ancorato al momento giusto) e il rischio di subscription leak (nessuna sottoscrizione persistente).
- **Utente non loggato**: il segmento è renderizzato fuori dal blocco `*ngIf="isLogged$|async"` — un utente anonimo vede comunque lo switch col nuovo default. Valutato e giudicato irrilevante: sotto viene mostrato comunque solo il messaggio "non sei loggato", indipendentemente dal tab selezionato — nessuna gestione speciale aggiunta.
- **Copertura test limitata al campo TS, non al binding DOM reale**: lo spec esistente e quello aggiornato restano istanze TS pure (`new FavouritesPage(...)`, nessun `TestBed`), coerente con lo stile preesistente (oc:8176) e con un pattern consolidato nel repo per evitare crash `NG0201` su `APP_TRANSLATION` mancante in DI (wm-core CLAUDE.md, oc:8183) — un eventuale disallineamento tra `selectedSegment` e il binding `[value]` sull'`ion-segment` non sarebbe intercettato da questo test, rischio accettato esplicitamente.
- **`doRefresh()` chiamato sempre indipendentemente dal segmento selezionato**: comportamento preesistente, non introdotto da questa modifica — con il nuovo default più utenti apriranno la pagina su 'layers' senza mai usare la fetch di `getFavouriteTracks()` fatta comunque. Non affrontato in questo ciclo (non è una regressione di questo fix).
- Nessun rischio di regressione sulla label ("Layers" vs "Cammini"): esplicitamente fuori scope, vedi sotto.

## Out of scope

- **Rinominare la label del tab da "Layers" a "Cammini"**: gestito lato backend, tramite override `config.json → TRANSLATIONS` per lo shard camminiditalia sulla chiave i18n esistente `'Layers'` (stesso meccanismo già usato in oc:7643 per la chiave `layers` minuscola). Nessuna modifica frontend necessaria per questo punto — decisione esplicita del developer in Fase: reverse-interaction.
- **Persistenza dell'ultimo tab usato tra sessioni**: non richiesta dal ticket, non aggiunta in questo ciclo — decisione esplicita del developer. Oggi il tab non è persistito (verificato nel codice, `favourites.page.ts:24`, nessun localStorage/store coinvolto) e resta così: il default cambia, ma resta uno stato hardcoded a ogni apertura della pagina.
- **Nuovo test Cypress e2e dedicato**: non aggiunto proattivamente. Se il test e2e esistente (`favourites.cy.ts`) dovesse fallire per questa modifica, va corretto (non è previsto che debba succedere, non fa assunzioni sul tab default).

## Moduli toccati

- `core/src/app/pages/favourites/favourites.page.ts` (repo principale, `webmapp-app`) — logica del default e guard su `showLayersSegment$`
- `core/src/app/pages/favourites/favourites.page.spec.ts` (repo principale, `webmapp-app`) — aggiornamento assert esistenti + nuovo caso guard
