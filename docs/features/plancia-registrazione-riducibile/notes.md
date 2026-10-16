# Notes — Plancia di registrazione riducibile

## Divergenze dal piano, task per task

### Task 1 bottone indietro

- `core/tsconfig.spec.json` include solo le cartelle elencate: aggiunta
  `src/app/components/track-recorder-component/**/*.spec.ts`, altrimenti lo spec nuovo non compila.
- **La stessa cartella va aggiunta anche a `architect.test.options.include` di `angular.json`**,
  scoperto solo dopo la prova su dispositivo: senza, `npm run test` (e la CI) non eseguiva i test
  della plancia e la suite completa restava a 116. Con l'aggiunta: 144 (116 + 28).

### Task 4 contenuto della linguetta

- **La transizione è stata implementata qui**, con quattro test: il brief del task non ne elencava i
  passi, il piano la richiamava soltanto. Web Animations su `transform` misurato, senza
  `fill: 'forwards'`; durante la trasformazione il `ResizeObserver` non pubblica, l'avviso si sposta
  solo a fine corsa.
- **Testo della seconda riga diverso dal prototipo B**: al posto di «mancano 7,1 km» / «6,30 km fatti»
  c'è l'icona della bandiera + «Arrivo» (chiave esistente `to`) + il badge di distanza, oppure
  l'icona dell'andamento + «6,30 km». Motivo: niente chiavi i18n nuove e ordine delle parole che non
  regge in tutte le lingue («7.1 km left» in inglese). **Da confermare con il dev.**
- Con il testo ingrandito si accorcia l'etichetta «Arrivo», non il valore (finding della review
  finale, corretto con un test).

### Task 5 redesign

- Il requisito «il tempo resta centrato sia con i badge sia senza» non vale più: la variante 3 scelta
  mette il tempo a sinistra e partenza/arrivo in una barra di avanzamento. Il test sul tempo centrato
  è stato sostituito da «senza traccia niente barra di avanzamento».
- La card ora sta a 12px dai bordi: prima della registrazione, durante lo slider, il bottone
  «indietro» (16px) si sovrappone all'angolo della card ancora trasparente. Da guardare su
  dispositivo.

## Bug trovati

- **Bottone «indietro» invisibile ma cliccabile durante la registrazione** (preesistente): chiude la
  registrazione senza la modale di salvataggio. Recepito come Task 1 del piano.
- **Modale di salvataggio chiusa senza scelta** (preesistente): la registrazione resta in pausa
  (`track-recorder.component.ts:186-211`). Fuori scope; qui si rende solo evidente la pausa.

## Decisioni

- **Studio di design**: artifact <https://claude.ai/artifact/MFPew2zpR88JJSbHPnJeDm> (canvas
  «Plancia di registrazione»), con tre forme ridotte (A pillola, B linguetta, C pallino) e tre
  plance aperte (1 essenziale, 2 scura, 3 compatta).
- **Scelte del dev**: forma ridotta **B, linguetta attaccata al bordo destro** (due righe: stato +
  tempo, poi «mancano X km» con traccia o «X km fatti» senza; in pausa fondo scuro e «In pausa» in
  giallo); plancia aperta **3, compatta con avanzamento** (tempo a 30px, velocità e media a destra,
  barra di avanzamento partenza→arrivo calcolata come `distanceCovered / (distanceCovered +
  remainingDistance)` in verde primario, assente senza traccia; comandi da 44px e «riduci» a destra).
- **Transizione animata** fra plancia aperta e linguetta, richiesta dal dev e approvata sulla tavola
  interattiva «Transizione 3 ↔ B» dell'artifact: la plancia si restringe verso l'angolo in alto a
  destra fino alla linguetta in 250 ms (`cubic-bezier(.4,0,.2,1)`), il contenuto della plancia sfuma
  e quello della linguetta compare con un leggero ritardo; la riapertura fa il percorso inverso in
  300 ms. L'avviso GPS si sposta solo a transizione finita. Con `prefers-reduced-motion`: solo
  dissolvenza breve. Nel codice: Web Animations su trasformazioni misurate (come l'avviso GPS), non
  su larghezza e altezza come nel prototipo.

- **Avviso sotto la linguetta, mai più in alto di oggi** (modifica dopo l'approvazione del piano): la
  linguetta B finisce a circa 115px, a 4px dall'avviso (119px); con i caratteri ingranditi l'avviso
  la coprirebbe. Il servizio pubblica quindi il bordo dell'elemento visibile, plancia aperta o
  linguetta, e lo SCSS usa `max(safe-area + 72px, bordo + 8px)`. Overview e piano aggiornati.

### Modifiche dopo la prova su dispositivo

- **iPhone SE, testata sovrapposta**: il tempo scende fino a 22px (`clamp(22px, 7.5vw, 30px)`) e
  non si restringe; velocità e media prendono lo spazio che resta e si accorciano con «…». Test
  «su uno schermo stretto la velocità media non finisce sopra il tempo».
- **Bottone indietro del dettaglio sopra la plancia**: scelta del dev, la plancia si stringe da
  sinistra solo con il dettaglio aperto (`left: 64px`: bottone a 16px, fab small da 40px, 8px di
  spazio). `map.page.html` passa `details.isOpen$` all'input `detailsOpen`. Scartate: spostare il
  bottone sotto la plancia, lasciare sempre 56px liberi.
- **Barretta di presa sulla linguetta**: c'era nel prototipo B e mancava nel codice.
- **Icona «riduci»**: `contract-outline` non era quella del prototipo e non piace al dev. Sulla
  tavola «Icona riduci la plancia» dell'artifact il dev ha scelto la **D**, freccia verso l'angolo in
  alto a destra dove compare la linguetta (SVG inline, `M7 17L17 7M9 7h8v8`). Scartata quella del
  primo prototipo: la squadretta nell'angolo opposto la fa leggere come «espandi».
- **Bottoni e tempo più piccoli** (richiesta del dev): bottoni a 40px a vista con l'area di tocco
  che resta da 44px (`::after` con `inset: -2px`), tempo `clamp(20px, 6.5vw, 26px)`.
- Test resi indipendenti dal tempo in headless: si chiudono solo le animazioni finite (il pallino
  pulsa all'infinito), e «in pausa mostra riprendi» chiude l'animazione prima di aspettarla.

### Task 6 linguetta con l'informazione a scelta

- Variante D scelta dal dev sulla tavola «Linguetta: scegli l'informazione scorrendo»: scorrimento
  verticale per non scontrarsi con il gesto «indietro» di Android dal bordo destro; puntini solo
  all'altezza della riga che cambia, perché accanto a tutta la linguetta sembravano riferirsi anche
  al tempo; barretta di presa tolta.
- Icone: Partenza e Arrivo usano quelle del dettaglio tecnico della traccia (`icon-outline-pin`,
  `icon-outline-flag` di wm-core); la velocità media usa `stats-chart-outline`, perché
  `analytics-outline` è l'icona della registrazione.
- Suite completa 160/160 (144 + 16 test nuovi), build verde.

## Follow-up

- Spostamento della linguetta lungo il bordo: rivalutabile dopo la verifica su dispositivo.
- Plancia aperta, km percorsi vicino ai pulsanti invece che agli altri valori: tre organizzazioni
  alternative sulla tavola «Plancia aperta: dove stanno i valori» dell'artifact; per ora il dev
  lascia la plancia com'è.
