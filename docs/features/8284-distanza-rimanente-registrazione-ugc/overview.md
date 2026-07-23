> Ticket: oc:8284

# Distanza rimanente durante la registrazione traccia UGC

## Cosa cambia

Il box di registrazione (`wm-track-recorder`, `track-recorder.component.*`) mostra, quando l'utente ha una traccia ufficiale (`EcTrack`) selezionata (`ec.currentEcTrack` — che sia stata selezionata navigando sulla pagina traccia, o manualmente mentre si registra), due nuovi badge: distanza dal punto di inizio e distanza dal punto di fine della traccia. I valori sono letti direttamente dai selettori già esistenti `trackDistanceCovered`/`trackRemainingDistance`/`trackPositionStale` (wm-core, `user-activity.selector.ts`, introdotti in oc:8177) — nessun nuovo calcolo, nessuno stato dedicato alla registrazione (vedi overview lato wm-core).

**Precisazione (confermata dal developer)**: questi due valori sono completamente indipendenti da "km percorsi" (`length`, riga già esistente, dato della registrazione reale accumulato da `GeoutilsService.getLength()`) — misurano la posizione GPS corrente proiettata sulla traccia ufficiale selezionata, non quanto effettivamente camminato/registrato in questa sessione.

**Comportamento quando la traccia non è (più) selezionata**: se l'utente non ha nessuna traccia selezionata, oppure chiude il pannello di dettaglio traccia, i due badge semplicemente non vengono mostrati — stesso comportamento già presente in `tab-detail.component.html` per la visualizzazione. Nessuna persistenza, nessun "pin": il box mostra la traccia selezionata in questo istante, non un riferimento fissato in precedenza. Decisione presa con il CTO in call (22/07/2026) dopo revisione di un approccio iniziale più elaborato, poi scartato (vedi overview lato wm-core, sezione Out of scope).

**Layout (studiato con la skill `ui-ux-pro-max`)**: i due badge occupano lo spazio oggi vuoto a sinistra e a destra del blocco centrale "IN MOVIMENTO" in `.wm-recorder-infopanel-top` — non aggiungono altezza al box (il badge riusato, `<wm-track-live-distance-badge>`, è una pillola compatta da 11px di font, già in produzione da oc:8177, non compete visivamente con il dato centrale in `--wm-font-xxlg`). Tecnica "flex sandwich": due colonne laterali `flex:1` **sempre presenti** nel markup (badge-inizio | centro invariato, senza `flex-grow` | badge-fine), che restano vuote (nessun figlio) quando il rispettivo valore è `null` — poiché entrambe le colonne hanno lo stesso `flex:1`, il blocco centrale resta perfettamente centrato sia con badge visibili sia vuote, identico visivamente al layout di oggi nel caso più comune (nessuna traccia selezionata). Preferita a due varianti di markup (`*ngIf/else` sull'intero blocco) perché più semplice da mantenere e priva del rischio "due varianti da tenere sincronizzate". Etichette "INIZIO"/"FINE" (chiavi i18n esistenti `from`/`to`, già introdotte in wm-core da oc:8177) nello stesso stile delle label uppercase `--wm-font-xsm` già usate per "VELOCITÀ ATTUALE"/"VELOCITÀ MEDIA"/"KM PERCORSI" sotto — nessuna nuova scala tipografica introdotta, nessuna nuova chiave i18n.

**Fuori scope per questo ciclo (proposto in call, non deciso)**: rinominare l'etichetta "IN MOVIMENTO" — il CTO l'ha proposta come ridondante, lo sviluppatore ha preferito lasciarla invariata in questo ciclo.

**Estensione richiesta a posteriori (dopo verifica su device reale, tre iterazioni)**: rivisto anche lo stile dei tre pulsanti azione (pausa/resume, stop, waypoint), delle etichette "PARTENZA"/"ARRIVO" e del blocco centrale, a valle di un confronto su mockup (skill `ui-ux-pro-max`, variante "Strumento" scelta dallo sviluppatore) e di due giri successivi di feedback sul risultato reale:
- **Pulsanti azione: colore per-azione introdotto e poi ripristinato al neutro originale** (`--background: var(--wm-color-light); --color: var(--wm-color-dark)`, nessun colore semantico) su richiesta esplicita dopo la terza verifica — mantenuta solo la forma circolare 38×38px (non contestata)
- **Icone direzionali accanto a "PARTENZA"/"ARRIVO" rimosse** dopo la prima iterazione (troppo rumore visivo secondo il feedback su device reale) — le etichette restano testo semplice, come nella prima versione dei Requisiti
- **Etichetta "IN MOVIMENTO" rimossa** (non solo rinominata come discusso con il CTO in call — eliminata del tutto): resta solo il timer, senza testo sopra. Chiave i18n `pages.register.time` non più referenziata da questo componente, lasciata invariata nei file di lingua (chiave orfana, stesso trattamento di altre chiavi non più usate nel codebase, es. oc:8221)
- **Blocco centrale ridotto** da `--wm-font-xxlg` (23px) a `--wm-font-xlg` (21px): con le due colonne laterali affiancate risultava troppo dominante
- **`recordStart()` dispatcha `setMapDetailsStatus({status: 'onlyTitle'})`** (azione/stato già esistenti in wm-core, nessuna modifica a wm-core per questo punto): all'avvio della registrazione, se un pannello di dettaglio (es. una traccia) è aperto, si riduce a solo titolo invece di restare espanso sopra la mappa. Non azzera `currentEcTrack` (a differenza della chiusura esplicita del pannello, `X`/dismiss, che lo azzera e fa scomparire i due badge — comportamento confermato invariato, vedi overview lato wm-core) — le distanze inizio/fine restano quindi disponibili nel box anche subito dopo l'avvio della registrazione con una traccia già selezionata
- **Nuovo `@Input() showSuffix: boolean = true` su `WmTrackLiveDistanceBadgeComponent`** (wm-core, componente condiviso con `tab-detail.component.html`/oc:8177): a `false` il badge mostra solo la distanza, senza il suffisso "da te" — ridondante nel box di registrazione dove il contesto è già dato dall'etichetta "PARTENZA"/"ARRIVO". Default `true` per non alterare l'uso esistente in visualizzazione; il box di registrazione passa `[showSuffix]="false"`. **Questo aggiunge una modifica a wm-core non prevista nella prima versione di questa sezione** (vedi overview lato wm-core, aggiornata di conseguenza)
- `min-width:0` + `text-overflow:ellipsis` sulle colonne laterali, per rendere il layout robusto al troncamento su schermi piccoli indipendentemente dallo spazio realmente disponibile
- `font-variant-numeric: tabular-nums` su timer e valori numerici, per un allineamento stabile delle cifre durante l'aggiornamento in tempo reale
- **Fix collaterale**: `averageSpeed` mostrava `∞` quando non calcolabile (bug preesistente in `GeoutilsService.getAverageSpeed`, non introdotto da oc:8284) — mitigato in `track-recorder.component.ts`/`.html` mostrando `—` quando il valore non è finito (`Number.isFinite`), senza modificare la funzione condivisa in wm-core

## Perché

Estensione della funzionalità già rilasciata in oc:8177 (distanza rimanente in visualizzazione traccia) al flusso di registrazione UGC, richiesta emersa in call del 21/07/2026 (Davide Nanna): l'obiettivo è incentivare l'uso della funzione di registrazione arricchendo il box con informazioni più contestuali, riusando dati e componenti già esistenti invece di introdurre nuova complessità (corretto in call di revisione del 22/07/2026 con il CTO).

## Requisiti

- [ ] `track-recorder.component.ts`: un nuovo `Observable<{distanceCovered: number|null; remainingDistance: number|null; stale: boolean}>` costruito con `combineLatest` su `trackDistanceCovered`/`trackRemainingDistance`/`trackPositionStale`/`confOPTIONSShowTrackRemainingDistance` (tutti selettori già pubblici in `@wm-core/store/user-activity/user-activity.selector` e `@wm-core/store/conf/conf.selector`) — **stesso gate già usato da `tab-detail.component.ts` (oc:8177)**: se `confOPTIONSShowTrackRemainingDistance` è `false`, i due valori restano `null` a prescindere dal dato reale. Trovato in Fase: write-plan leggendo `tab-detail.component.ts:44-58`: senza questo gate, uno shard che disabilita la card di visualizzazione vedrebbe comunque i badge nel box di registrazione — incoerenza non individuata nelle fasi precedenti
- [ ] `track-recorder.component.html`: `.wm-recorder-infopanel-top` ristrutturato con due nuove colonne laterali (`.wm-recorder-infopanel-top-side`) sempre presenti nel markup, prima e dopo `.wm-recorder-infopanel-top-center` (che resta invariata). Ciascuna colonna: label uppercase xsm ("INIZIO"/"FINE", chiavi i18n `from`/`to`) + `<wm-track-live-distance-badge [distanceMeters]="..." [stale]="...">`, con `*ngIf` sul valore per non renderizzare l'etichetta quando il badge è assente (il badge gestisce già internamente `*ngIf="distanceMeters != null"` sul proprio contenuto, ma la label va nascosta esplicitamente altrimenti resterebbe orfana)
- [ ] `track-recorder.component.scss`: `.wm-recorder-infopanel-top-side { flex: 1; display:flex; flex-direction:column; align-items:center; }` — tecnica "flex sandwich": con entrambe le colonne laterali a `flex:1` e il centro a larghezza intrinseca, il centro resta centrato sia con colonne vuote sia piene, senza bisogno di `justify-content:center` sul contenitore (rimuovere `justify-content:center` da `.wm-recorder-infopanel-top`, non più necessario). Nessuna modifica a `.wm-recorder-infopanel-top-center` (markup e stile invariati)
- [ ] Nessuna nuova chiave i18n — riuso di `from`/`to` (wm-core), verificato senza conflitto con la chiave nidificata `detail.from`/`detail.to` del repo principale (verificato in Fase: challenge)

## Rischi

- **Box già denso** — mitigato dal fatto che i badge occupano spazio oggi vuoto (non spazio già occupato) e sono compatti (pillola 11px); da verificare comunque visivamente su device reale/schermi piccoli (412×832, viewport target Cypress)
- **Colonne laterali vuote sempre nel DOM** — le due `.wm-recorder-infopanel-top-side` esistono sempre (anche senza badge), a differenza di oggi dove non esiste alcun elemento a fianco del centro; rischio minimo (div vuoti senza contenuto non hanno impatto visivo né di performance), preferito rispetto a due varianti di markup separate (rischio di divergenza tra le due, eliminato da questa scelta)
- **Dipendenza dalla logica wm-core esistente (oc:8177), non da codice nuovo** — nessun controllo aggiuntivo lato UI se quella logica ha un bug; il rischio esiste già in produzione indipendentemente da questo ticket

## Out of scope

- Marker/indicatore visivo di progressione nel box (a differenza del profilo altimetrico in oc:8177, qui non c'è un grafico su cui posizionare un marker)
- Modifica del layout complessivo del box oltre alle due colonne laterali in `.wm-recorder-infopanel-top`
- Persistenza/pin della traccia associata, gestione esplicita del cambio traccia durante la registrazione — **respinto dal CTO in review**, vedi overview lato wm-core
- Rinominazione dell'etichetta "IN MOVIMENTO" (proposta dal CTO in call, non confermata dallo sviluppatore — resta invariata in questo ciclo)

## Moduli toccati

**core (repo principale):**
- `src/app/components/track-recorder-component/track-recorder.component.ts` — incluso il dispatch di `setMapDetailsStatus({status:'onlyTitle'})` in `recordStart()` (azione già esistente in wm-core, riusata)
- `src/app/components/track-recorder-component/track-recorder.component.html`
- `src/app/components/track-recorder-component/track-recorder.component.scss`

Nessuna modifica ai file i18n del repo principale.

**wm-core (submodule):** vedi `core/src/app/shared/wm-core/docs/features/8284-distanza-rimanente-registrazione-ugc/overview.md` — `REMAINING_DISTANCE_MAX_SPEED_MS` + nuovo `@Input() showSuffix` su `WmTrackLiveDistanceBadgeComponent` (aggiunto a valle della review su device reale, vedi sezione "Estensione richiesta a posteriori").
