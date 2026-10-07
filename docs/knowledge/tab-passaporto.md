# Tab Passaporto di camminiditalia

## Come funziona oggi

Il passaporto a timbri e il dettaglio del cammino stanno in `wm-core` (sua pagina
`docs/knowledge/8166-passaporto-camminatore-validazione-credenziale-cartacea.md`); qui ci sono la
voce della tab bar, la rotta e la pagina che li ospita.

- **Voce e rotta solo nella build camminiditalia**, con le varianti `fileReplacements` della tab
  bar e del routing (vedi [temi-e-varianti-di-shard.md](temi-e-varianti-di-shard.md)): rotta
  `passport` con il modulo lazy `PassportPageModule`, voce con la stessa condizione di Preferiti
  (`authEnable$ && isLogged$`) e l'icona `assets/icons/passport-stamp.svg` in `<ion-icon src>`.
- **Guardia `passportGuard`**: aspetta che la config sia caricata (`isConfLoaded`) e che il login
  sia noto (`resolvedLogin$`), poi lascia entrare solo con autenticazione attiva e utente loggato;
  altrimenti `/home`.
- **Login noto (`resolvedLogin$`, `pages/passport/passport-auth.ts`)**: all'avvio `isLogged` vale
  `false` finché `me()` non risponde. Il login si considera noto quando l'utente risulta loggato
  oppure quando non c'è più un `access_token` in `localStorage`, che ogni logout, il fallimento di
  `me()` e la cancellazione dell'account tolgono.
- **`PassportPage`**: ospita `<wm-passport-stamps>`. Ascolta il login solo mentre è visibile, da
  `ionViewWillEnter` a `ionViewWillLeave`, e al logout torna alla Home; dal secondo ingresso nel tab
  rilegge `/api/passport` con `refreshPassport()`.

## Perché così

- **Varianti invece del file condiviso** (oc:8703): per i vincoli vedi
  `.claude/rules/file-replacements.md`; il tab esce solo con `deploy-to-web-camminiditalia`.
- **Login noto invece di `isLogged`** (oc:8703): con `take(1)` su `isLogged` un utente loggato che
  ricarica la PWA su `/passport` finiva in Home, e la pagina navigava via appena aperta.
- **Ascolto del logout solo a pagina visibile** (oc:8703): Ionic tiene in memoria le pagine dei tab,
  quindi `ngOnInit` non riparte a ogni ingresso. Con l'ascolto in `ngOnInit` un logout dal Profilo
  portava in Home, e dopo un secondo login la pagina restava su uno spinner.

## Come ci siamo arrivati

- **Passaporto come sotto-tab del Profilo** (oc:8703, superato): era il wireframe di oc:8166; il
  cliente l'ha chiesto come voce a sé nella tab bar.
