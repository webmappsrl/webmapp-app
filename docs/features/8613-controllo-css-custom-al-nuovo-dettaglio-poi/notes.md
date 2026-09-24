> Ticket: oc:8613

# Notes — Controllo CSS custom al nuovo dettaglio POI (webmapp-app)

Il *perché* duraturo sta in
[docs/knowledge/temi-e-varianti-di-shard.md](../../knowledge/temi-e-varianti-di-shard.md),
sezione «La trappola degli override di tema», dove i due casi di questo ticket sono stati
aggiunti accanto a quello di oc:8305. Qui resta la cronaca.

## Deviazioni dal piano

- **Non c'era un piano.** Il lavoro è partito da una segnalazione in QA — «le Informazioni sono
  sotto al nome e non va bene» — e il `plan.md` è una registrazione a posteriori, dichiarata
  come tale in testa al file.

## Bug trovati

- **Quattro selettori del tema 75 scollegati dal refactor di oc:8406.** Il più grave era
  `wm-feature-useful-urls`, diventato `.wm-poi-properties-contacts`: senza la sua regola il
  blocco perdeva `order: 9` e, valendo 0, risaliva **sopra tutti gli altri**, comparendo sotto
  il titolo. Aveva perso anche i propri stili, perché altre quattro regole puntavano allo stesso
  wrapper morto.

- **La spaziatura sotto la linea di separazione, sparita per una catena di due cose ragionevoli.**
  `75.css` dichiara `--wm-feature-details-margin: 0px !important`: su quell'app lo spazio lo dà
  il `padding` di ciascun blocco, non il margine comune. Il commit `671d4ed` di oc:8406 ha tolto
  all'HTML incorporato il padding proprio spostando lo spazio su quel margine — neutro ovunque,
  **tranne dove il margine è azzerato**. Risultato: il riquadro attaccato alla linea.

- **Un orfano preesistente nel dettaglio traccia**: `wm-track-properties wm-tab-audio`, mentre il
  componente è `wm-track-audio`. Non causato da oc:8406 — quel selettore non ha mai agganciato
  nulla. Corretto perché identico agli altri e a costo zero.

## Decisioni

- **`wm-config-detail` lasciato senza `order`**, su indicazione esplicita del dev: non esisteva
  quando il tema è stato scritto e non sarà presente su questa app. Ha altezza 0, quindi sta in
  cima senza spostare nulla. Se un domani venisse popolato qui, comparirebbe nel posto sbagliato.

- **`wm-tab-detail` (`order: 8`) lasciato invariato**: non è montato nel dettaglio POI, la regola
  è inerte. Rimuoverla avrebbe cambiato la struttura del tema, che il dev ha chiesto di mantenere.

- **`!important` sulla spaziatura, dopo una verifica e non per riflesso.** Il primo tentativo
  senza non funzionava: la regola c'era nel file servito ma non si applicava. La regola del tema
  e quella del componente hanno la **stessa specificità** (una classe e due tag entrambe), e il
  CSS del componente Angular è iniettato **dopo** il foglio statico, quindi a parità vinceva lui.

- **Fix nel tema e non in wm-core**, su richiesta del dev («solo modifiche CSS»). L'alternativa —
  rivedere la regola del ritmo verticale perché non presupponga quella variabile — resta la
  correzione alla radice, ma tocca un componente condiviso.

## Falsi allarmi, registrati perché non si ripercorrano

- **«Ottieni indicazioni non funziona più».** Non era una regressione. L'effect
  `startGetDirections$` (`user-activity.effects.ts:351`) mette `onLocationChange$` dentro un
  `withLatestFrom`, che non emette finché **tutte** le sorgenti hanno emesso: senza
  geolocalizzazione attiva l'effect non parte, e il ramo `if (poiFirstCoords)` — che della
  posizione non ha bisogno — non viene mai raggiunto. `git blame`: riga del **13/01/2026**,
  nessun commit di oc:8406 la tocca. Verificato che **anche la produzione si comporta così** con
  il permesso non concesso. Il dev ha poi attivato la localizzazione e il pulsante ha funzionato.
  Resta un difetto reale, non nostro: per i POI quella dipendenza è inutile.

- **«Sulla mobile manca tutto il corpo del dettaglio»**, segnalato dall'agente della webapp. Il
  corpo era completo: la misura era stata presa mentre il pannello era montato ma ancora
  collassato. Succede anche a me: la prima query dava `wm-poi-properties` assente, la seconda un
  pannello alto 0, e solo dopo qualche secondo il contenuto. **Misurare il DOM del pannello senza
  attendere il mount produce falsi negativi.**

## Follow-up

- **La regola di wm-core che ha causato il secondo difetto resta invariata**: presuppone che
  `--wm-feature-details-margin` sia valorizzata. Oggi solo il 75 la azzera, quindi non urge, ma
  qualunque tema futuro che faccia lo stesso avrà lo stesso problema.
- **`wm-phone`/`wm-email` e l'effect delle indicazioni** restano difetti noti di wm-core fuori
  dallo scope di un ticket di soli CSS.
- **Temi condivisi fra i due prodotti**: valutazione rimandata dal dev. I numeri e la fattibilità
  stanno nelle note di oc:8406.
