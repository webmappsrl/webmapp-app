# Preferiti: i due tab e il default

## Come funziona oggi

`FavouritesPage` ha due tab — «Layers» e «Sentieri» — realizzati con un `ion-segment`, non con `ion-tabs` annidati. Il tab di default segue `showLayersSegment$` con una **sottoscrizione continua**, non un gate one-shot, e un guard `_userSelectedSegmentManually` disattiva il sync automatico appena l'utente tocca lo switch. Se il flag torna `false` dopo essere stato `true`, il tab si resetta a `'tracks'`.

La lista dei layer riusa `wm-layer-box` e `LayerFavoriteService` da `wm-core`.

## Perché così

- **Un gate one-shot su `isConfLoaded` non basta** (oc:8465): `getConf()` emette due volte — prima la cache, poi la fetch fresca — e `isConfLoaded` è un latch che diventa `true` alla prima `loadConfSuccess`, spesso quella dalla cache stale. Il default restava congelato sul valore vecchio. Scoperto in review formale, non in challenge né dai test della prima implementazione: erano tutti scritti con `of()`, che non può esercitare transizioni multiple nel tempo.
- **Il guard sulla scelta manuale** (oc:8465): senza, una scelta fatta durante un cold start lento veniva sovrascritta appena arrivava la config.
- **Il reset a `'tracks'`** (oc:8465) evita un vicolo cieco: se la config si ricarica con il flag a `false`, senza reset non ci sarebbe più modo di tornare a Sentieri.
- **`ion-segment` invece di `ion-tabs`** (oc:8176): un cambio di vista in-page non deve generare voci di navigazione e di history.
- **`OnDestroy`/`takeUntil`** (oc:8465): nella prima versione un `take(1)` che non si risolve mai — config mai caricata, offline — avrebbe lasciato la subscription viva per tutta la sessione.
- **Il ticket descriveva i preferiti-tracce come «non implementati»** (oc:8305): erano già in produzione. Il lavoro reale è stata l'estensione a un secondo tab, non la costruzione da zero.

## Debito noto

- **Rischio residuo accettato** (oc:8465): se l'utente sta usando la tab tracce senza mai toccare lo switch e il flag passa da `false` a `true` a sessione avviata — per esempio a una riconnessione — il sync continuo lo sposta comunque su «Cammini», perdendo la posizione di scroll. Il guard si attiva solo su un tap esplicito, non sul semplice uso del contenuto. Non affrontato per non introdurre un secondo concetto di «interazione utente».
- **`favourites.cy.ts` fallisce identicamente con e senza il fix** (oc:8465), verificato via `git stash`: la causa è il mismatch fra shard servito in locale e `appId` atteso dagli spec, non il codice.
