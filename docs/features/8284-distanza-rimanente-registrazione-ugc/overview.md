> Ticket: oc:8284

# Distanza rimanente durante la registrazione traccia UGC

## Cosa cambia

Il box di registrazione (`wm-track-recorder`, `track-recorder.component.*`) mostra, quando l'utente ha una traccia ufficiale (`EcTrack`) selezionata (`ec.currentEcTrack` — che sia stata selezionata navigando sulla pagina traccia, o manualmente mentre si registra), due nuovi badge: distanza dal punto di inizio e distanza dal punto di fine della traccia. I valori sono letti direttamente dai selettori già esistenti `trackDistanceCovered`/`trackRemainingDistance`/`trackPositionStale` (wm-core, `user-activity.selector.ts`, introdotti in oc:8177) — nessun nuovo calcolo, nessuno stato dedicato alla registrazione (vedi overview lato wm-core).

**Precisazione (confermata dal developer)**: questi due valori sono completamente indipendenti da "km percorsi" (`length`, riga già esistente, dato della registrazione reale accumulato da `GeoutilsService.getLength()`) — misurano la posizione GPS corrente proiettata sulla traccia ufficiale selezionata, non quanto effettivamente camminato/registrato in questa sessione.

**Comportamento quando la traccia non è (più) selezionata**: se l'utente non ha nessuna traccia selezionata, oppure chiude il pannello di dettaglio traccia, i due badge semplicemente non vengono mostrati — stesso comportamento già presente in `tab-detail.component.html` per la visualizzazione. Nessuna persistenza, nessun "pin": il box mostra la traccia selezionata in questo istante, non un riferimento fissato in precedenza. Decisione presa con il CTO in call (22/07/2026) dopo revisione di un approccio iniziale più elaborato, poi scartato (vedi overview lato wm-core, sezione Out of scope).

**Layout (studiato con la skill `ui-ux-pro-max`)**: i due badge occupano lo spazio oggi vuoto a sinistra e a destra del blocco centrale "IN MOVIMENTO" in `.wm-recorder-infopanel-top` — non aggiungono altezza al box (il badge riusato, `<wm-track-live-distance-badge>`, è una pillola compatta da 11px di font, già in produzione da oc:8177, non compete visivamente con il dato centrale in `--wm-font-xxlg`). Struttura a tre colonne (badge-inizio | centro invariato | badge-fine) **solo** quando entrambi i valori sono disponibili; quando assenti, il markup ricade esattamente sul layout centrato di oggi — degrado gestito con due varianti di markup (`*ngIf/else`), non con CSS che nasconde elementi vuoti, per garantire zero regressioni visive sul caso "nessuna traccia selezionata" (il caso più comune). Etichette "INIZIO"/"FINE" (chiavi i18n esistenti `from`/`to`, già introdotte in wm-core da oc:8177) nello stesso stile delle label uppercase `--wm-font-xsm` già usate per "VELOCITÀ ATTUALE"/"VELOCITÀ MEDIA"/"KM PERCORSI" sotto — nessuna nuova scala tipografica introdotta, nessuna nuova chiave i18n.

**Fuori scope per questo ciclo (proposto in call, non deciso)**: rinominare l'etichetta "IN MOVIMENTO" — il CTO l'ha proposta come ridondante, lo sviluppatore ha preferito lasciarla invariata in questo ciclo.

## Perché

Estensione della funzionalità già rilasciata in oc:8177 (distanza rimanente in visualizzazione traccia) al flusso di registrazione UGC, richiesta emersa in call del 21/07/2026 (Davide Nanna): l'obiettivo è incentivare l'uso della funzione di registrazione arricchendo il box con informazioni più contestuali, riusando dati e componenti già esistenti invece di introdurre nuova complessità (corretto in call di revisione del 22/07/2026 con il CTO).

## Requisiti

- [ ] `track-recorder.component.ts`: tre nuovi `Observable` (analoghi a `onRecord$`) da `@wm-core/store/user-activity/user-activity.selector` — `trackDistanceCovered`, `trackRemainingDistance`, `trackPositionStale` (quest'ultimo per l'`@Input() stale` del badge). Selettori già pubblici, nessuna modifica a wm-core
- [ ] `track-recorder.component.html`: `.wm-recorder-infopanel-top` ristrutturato con due varianti di markup (`*ngIf...else`) — variante A (oggi, invariata byte-per-byte) quando `trackDistanceCovered`/`trackRemainingDistance` sono entrambi `null`; variante B (tre colonne flex: badge-inizio | centro | badge-fine, ciascuna colonna laterale `flex:1` con contenuto centrato) quando almeno uno dei due è disponibile. Badge: label uppercase xsm ("INIZIO"/"FINE", chiavi i18n `from`/`to`) + `<wm-track-live-distance-badge [distanceMeters]="..." [stale]="(trackPositionStale$|async)">` (il badge già gestisce internamente `*ngIf="distanceMeters != null"`, quindi una singola colonna può restare vuota se solo uno dei due valori è disponibile)
- [ ] `track-recorder.component.scss`: nuove classi per le due colonne laterali (`flex:1`, contenuto centrato nella propria colonna, stessa gap/padding del blocco centrale); nessuna modifica alle classi esistenti (`.wm-recorder-infopanel-top-center` resta invariata, sia nel markup che nello stile)
- [ ] Nessuna nuova chiave i18n — riuso di `from`/`to` (wm-core), verificato senza conflitto con la chiave nidificata `detail.from`/`detail.to` del repo principale (verificato in Fase: challenge)

## Rischi

- **Box già denso** — mitigato dal fatto che i badge occupano spazio oggi vuoto (non spazio già occupato) e sono compatti (pillola 11px); da verificare comunque visivamente su device reale/schermi piccoli (412×832, viewport target Cypress)
- **Due varianti di markup (`*ngIf/else`) da mantenere sincronizzate** — se in futuro cambia lo stile del blocco centrale "IN MOVIMENTO", va aggiornato in entrambe le varianti; accettato deliberatamente per garantire zero regressioni sul layout esistente quando i badge sono assenti (il caso più comune, box senza traccia selezionata)
- **Dipendenza dalla logica wm-core esistente (oc:8177), non da codice nuovo** — nessun controllo aggiuntivo lato UI se quella logica ha un bug; il rischio esiste già in produzione indipendentemente da questo ticket

## Out of scope

- Marker/indicatore visivo di progressione nel box (a differenza del profilo altimetrico in oc:8177, qui non c'è un grafico su cui posizionare un marker)
- Modifica del layout complessivo del box oltre alle due colonne laterali in `.wm-recorder-infopanel-top`
- Persistenza/pin della traccia associata, gestione esplicita del cambio traccia durante la registrazione — **respinto dal CTO in review**, vedi overview lato wm-core
- Rinominazione dell'etichetta "IN MOVIMENTO" (proposta dal CTO in call, non confermata dallo sviluppatore — resta invariata in questo ciclo)

## Moduli toccati

**core (repo principale):**
- `src/app/components/track-recorder-component/track-recorder.component.ts`
- `src/app/components/track-recorder-component/track-recorder.component.html`
- `src/app/components/track-recorder-component/track-recorder.component.scss`

Nessuna modifica ai file i18n del repo principale.

**wm-core (submodule):** vedi `core/src/app/shared/wm-core/docs/features/8284-distanza-rimanente-registrazione-ugc/overview.md` — solo `REMAINING_DISTANCE_MAX_SPEED_MS`, nessun'altra modifica.
