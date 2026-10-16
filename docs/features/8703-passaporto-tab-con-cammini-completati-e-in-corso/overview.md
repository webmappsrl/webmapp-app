> Ticket: oc:8703

# Passaporto: tab con cammini completati e in corso

Il lavoro tocca tre repo: questo (la voce nella tab bar e la pagina del tab), `wm-core` (il passaporto a timbri
e il dettaglio nello stato completato) e il backend `camminiditalia` (l'immagine di
condivisione del cammino completato). Ciascuno ha il proprio `overview.md` nella cartella con lo
stesso slug; questo è il riferimento d'insieme.

## Cosa cambia

Nell'app di camminiditalia la tab bar in basso ha una voce in più, **Passaporto**, fra Preferiti
e Profilo: Home · Mappa · Preferiti · Passaporto · Profilo. Come Preferiti, la voce compare solo a
utente loggato. La pagina è un **passaporto a timbri**: una griglia con **tutti i cammini** della
config, ciascuno col suo logo dentro l'anello di avanzamento. In cima i cammini **in corso** (anello
parziale, «19/30 tappe»), poi i **completati** (anello pieno, «✓ Completato»), poi quelli **non
iniziati**, in grigio, col numero di tappe («6 tappe»). Non c'è una pagina vuota: chi non ha ancora
nessuna tappa validata vede tutti i timbri in grigio, con una riga che spiega come colorarli.

Toccando un timbro, anche grigio, si apre il **dettaglio del cammino già esistente** (oc:8676):
per un cammino non iniziato mostra «0 di 6 tappe» e «Richiedi certificazione». Se il cammino è
completato, il dettaglio si mostra come la vista 6 del wireframe: «Cammino completato! 🎉»,
«Completato il <data>», le caselle km e tappe, il pulsante «Condividi il traguardo» e la lista
delle tappe chiusa ma apribile, da cui ogni tappa resta condivisibile come in oc:8702. Lo stesso
vale aprendo il dettaglio dal riquadro verde della home del layer sulla mappa: vista 2 e vista 6
sono la stessa schermata in due stati.

Il wireframe è aggiornato in `docs/features/passaporto-camminatore-wireframe.html` (viste 5, 5b, 5c, 6
e tab bar); si pubblica su `gh-pages` a ticket approvato.

## Perché

Il cliente ha chiesto il passaporto come «un tab in più» (scrum del 06/10, 08:35) e non come
sotto-tab del Profilo, come era nel wireframe. Il passaporto diventa così un'area a sé, al pari
dei Preferiti. Il traguardo di un cammino oggi non ha un momento dedicato: il dettaglio di un
cammino completato cambia solo il sottotitolo.

## Requisiti

- [ ] La tab bar di camminiditalia mostra «Passaporto» fra Preferiti e Profilo, con la stessa
      condizione di Preferiti (`authEnable$` e `isLogged$`). Gli altri shard non cambiano.
- [ ] La personalizzazione si fa con `fileReplacements` nella configuration `camminiditalia` di
      `core/angular.json`: varianti `.camminiditalia` di `tabs.page.ts` (con il proprio template)
      e di `tabs-routing.module.ts` (con la rotta `passport`). I file condivisi restano identici.
- [ ] Una guardia sulla rotta `passport` porta alla Home chi non è loggato: copre il logout mentre
      si è sul tab, il logout per token scaduto (`logoutByError$`, che non naviga) e l'apertura
      della rotta da URL nella PWA.
- [ ] La griglia mostra **tutti i layer di `confMAPLAYERS`**, uniti all'avanzamento di
      `GET /api/passport` (`PassportService.passportRoutes$()`), senza chiamate nuove. Titolo, logo
      e immagine vengono dalla config. Completato = `completed: true`; in corso = presente in
      `/api/passport` e non completato; non iniziato = assente da `/api/passport`.
- [ ] Ogni timbro: logo nell'anello (`percent` del backend), nome del cammino e una riga di testo —
      in corso «19/30 tappe», completato «✓ Completato», non iniziato «6 tappe» da
      `layer.attributes.stage_count` (riga omessa se il dato manca). Non iniziato in grigio.
      **Niente km** e niente barra.
- [ ] Ordine: prima gli **in corso**, dal più avanzato (`percent`), a parità nell'ordine della
      config; poi i **completati**, nell'ordine della config (`/api/passport` non porta la data di
      completamento); poi i **non iniziati**, nell'ordine della config.
- [ ] La lista si rilegge quando l'utente rientra nel tab (`PassportService.refreshPassport()`,
      nuovo in `wm-core`).
- [ ] Senza cammini iniziati, sopra la griglia tutta grigia: «Ogni tappa che ti viene riconosciuta
      colora il timbro del suo cammino.» Il testo non nomina il tipo di validazione, perché
      arriverà anche il GPS.
- [ ] Toccando un timbro, di qualunque stato, si apre la modale del dettaglio esistente
      (`WmPassportModalComponent`) con `layerId`, titolo, logo e immagine del layer.
- [ ] Dettaglio di un cammino completato (in `wm-core`, vedi il suo overview): testata di
      celebrazione, «Completato il» con il `completedAt` più recente, caselle km e tappe,
      «Condividi il traguardo», lista delle tappe chiusa e apribile.
- [ ] I testi nuovi hanno la chiave uguale al testo italiano e la traduzione in tutte le lingue di
      `wm-core/localization/i18n/` (it, en, de, es, fr, pr, sq).
- [ ] [UX] La voce attiva della tab bar è riconoscibile per colore e icona, come le altre; icona
      SVG coerente con il set `icon-outline-*`, niente emoji nella tab bar.
- [ ] [UX] Mentre `/api/passport` e la config dei layer non hanno risposto la pagina mostra uno
      stato di caricamento, non la griglia grigia; se la lettura fallisce senza dati precedenti, un
      messaggio d'errore con «Riprova». Chi ha dei cammini iniziati non deve mai vederli tutti
      grigi per un problema di rete.
- [ ] [UX] Ogni timbro toccabile ha un'area di almeno 44×44 px e un'etichetta accessibile con nome
      e stato («Via degli Dei, 3 di 5 tappe», «…, completato», «…, non iniziato»).
- [ ] [UX] Lo stato non si legge solo dal colore: anello e grigio sono sempre accompagnati dal
      testo del timbro. Con il grigio il nome resta leggibile (contrasto almeno 4,5:1).

## Rischi

- **Rotta condivisa.** Aggiungere `passport` in `tabs-routing.module.ts` lo cambierebbe per tutti
  gli shard: per questo anche il routing ha una variante `.camminiditalia`. Le varianti duplicano
  per intero il file originale (vincolo di `fileReplacements`, vedi `.claude/rules/`): una modifica
  futura al file condiviso va riportata a mano nella variante.
- **Deploy web multi-tenant.** La variante esiste solo nella build `camminiditalia`; il deploy web
  generico resta senza la voce. Va usato `deploy-to-web-camminiditalia`.
- **Ordine dei rilasci.** «Condividi il traguardo» richiede il nuovo endpoint del backend
  `camminiditalia`. Una build già approvata dagli store non si ritira: **il backend va in
  produzione prima di caricare la build sugli store e prima di `deploy-to-web-camminiditalia`**.
  Se l'ordine salta, l'anteprima mostra già un errore con «Riprova» e l'app non si blocca. Nessun
  flag remoto: il caso si evita con l'ordine dei rilasci.
- **Griglia lunga.** Con molti cammini la griglia si allunga; i cammini iniziati stanno sempre in
  cima, quindi chi ne ha resta senza scorrere. Anche i layer della config che non sono cammini
  comparirebbero come timbri: va verificato sulla config di produzione che ogni layer di
  camminiditalia sia un cammino.
- **Cinque voci nella tab bar.** Con «Preferiti» e «Passaporto» (in de/fr «Favoriten»,
  «Reisepass», «Passeport») le etichette vanno verificate su un telefono stretto (320 px).

## Out of scope

- I km nel passaporto a timbri.
- «Racconta la tua esperienza» nella vista 6.
- Il numero di uscite visibile: richiede la validazione GPS (oc:8165). La condizione è già nel
  codice di `wm-core`, ma oggi non si verifica mai.
- La validazione delle tappe (oc:8166, oc:8165).

## Moduli toccati

**webmapp-app**
- `core/angular.json` — due `fileReplacements` nella configuration `camminiditalia`
- `core/src/app/pages/tabs/tabs.page.camminiditalia.ts` e `.html` — nuovi, con la voce Passaporto
- `core/src/app/pages/tabs/tabs-routing.module.camminiditalia.ts` — nuovo, con la rotta `passport`
- `core/src/app/pages/passport/` — nuova pagina del tab (modulo lazy) con la guardia di login, che ospita il passaporto a timbri di `wm-core`
- `docs/features/passaporto-camminatore-wireframe.html` — già aggiornato

**wm-core** — vedi `core/src/app/shared/wm-core/docs/features/8703-…/overview.md`

**camminiditalia (backend)** — vedi `docs/features/8703-…/overview.md` in quel repo
