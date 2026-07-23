> Ticket: oc:8284

# Notes — Distanza rimanente durante la registrazione traccia UGC

## Deviazioni dal piano

- **Riprogettazione visiva del box (pulsanti azione, etichette PARTENZA/ARRIVO) non prevista nel `plan.md` originale** — richiesta dallo sviluppatore dopo aver verificato l'implementazione su device reale (screenshot condiviso), con tre mockup alternativi prodotti via skill `ui-ux-pro-max` (variante A "Strumento" scelta e adottata). Non è stata rifatta la Fase: challenge/estimation per questa estensione (solo styling/markup dello stesso componente già in scope, nessuna nuova logica di store/servizio) — vedi overview.md, sezione "Estensione richiesta a posteriori".
- **Seconda iterazione dopo un secondo screenshot su device reale**: rimosse le icone direzionali accanto a "PARTENZA"/"ARRIVO" (troppo rumore visivo), ridotto il font del blocco centrale, aggiunto `@Input() showSuffix` a `WmTrackLiveDistanceBadgeComponent` (wm-core) per nascondere il suffisso "da te" nel box di registrazione — quest'ultimo è l'unica modifica di questo intero ciclo che tocca un componente condiviso con un'altra schermata già in produzione (`tab-detail.component.html`, oc:8177); mitigato con un default che preserva il comportamento esistente (`showSuffix = true`), nessuna modifica al chiamante esistente.
- **Terza iterazione dopo un terzo screenshot su device reale**: ripristinato lo stile neutro (nessun colore) dei pulsanti azione, introdotto solo un'iterazione prima — il developer ha deciso di annullare quella parte specifica del redesign "per ora", mantenendo invece le altre modifiche (badge, colonne laterali, dimensione del blocco centrale). Rimossa anche del tutto l'etichetta "IN MOVIMENTO" (in call con il CTO era stata solo proposta come rinominabile, non come da eliminare — decisione più netta presa qui dallo sviluppatore).
- **Punto aperto dalla call con il CTO, chiuso a parte**: `recordStart()` ora dispatcha `setMapDetailsStatus({status: 'onlyTitle'})` — azione/stato già esistenti in wm-core (introdotti per altri flussi: `goToHome`, back navigation), riusati senza modifiche a wm-core. Comportamento distinto da quanto discusso e poi respinto in call (l'override della chiusura esplicita del pannello): qui si riduce il pannello solo all'avvio della registrazione, non si intercetta il pulsante di chiusura — la chiusura esplicita continua ad azzerare `currentEcTrack` come sempre.

## Bug trovati

- **`averageSpeed` mostra `∞` invece di un valore o di un placeholder quando non calcolabile** (`GeoutilsService.getAverageSpeed`, wm-core) — visibile nello screenshot reale fornito dallo sviluppatore. Causa non isolata a fondo (probabile divisione per un tempo trascorso non gestito correttamente in un caso limite); **non risolto alla radice** in questo ciclo per non toccare un servizio condiviso usato altrove — mitigato solo a livello di visualizzazione in `track-recorder.component.ts`/`.html` (mostra `—` se `!Number.isFinite(avgSpeed)`). Follow-up: isolare la causa esatta in `GeoutilsService.getAverageSpeed`/`getSpeeds`/`getTime` in un ticket dedicato.
- **`--wm-color-danger`/`--wm-color-warning` usate nel codice esistente (`.rec` in `track-recorder.component.scss`, ora rimosso) ma mai definite in `src/theme/variables.scss`** — probabile causa del colore/border mancante sull'icona "rec" nella versione precedente del componente. Non approfondito oltre (il nuovo styling usa `--ion-color-*`, che sono realmente definiti), ma segnalato perché potrebbe interessare altri punti del codice che referenziano le stesse variabili inesistenti.

## Decisioni

- Icone dei pulsanti azione (pausa/resume/stop/waypoint) lasciate invariate (`pause-outline`, `save-outline`, `pin-outline`, `ellipse`) in tutte le iterazioni — cambiato solo il trattamento visivo del contenitore (forma circolare 38×38px; il colore per-azione introdotto nella seconda iterazione è stato poi rimosso nella terza, vedi "Deviazioni"), mai il significato/icona, per non introdurre un cambio di semantica non discusso esplicitamente (es. l'icona "save" per lo stop resta corretta: fermare la registrazione apre sempre un dialogo di salvataggio).
- Icona a bandiera accanto alle etichette "PARTENZA"/"ARRIVO": introdotta nella prima iterazione, **poi rimossa nella seconda** (vedi "Deviazioni" — questa voce è rimasta erroneamente non aggiornata in una revisione precedente di questo file). Stato finale: nessuna icona, solo testo (`from`/`to` via `wmtrans`).
- `WmTrackLiveDistanceBadgeComponent` (wm-core) non modificato nel markup interno per l'icona a bandiera — la label resta fuori dal componente condiviso con `tab-detail.component.html` (oc:8177), per non allargare il raggio d'azione a un'altra schermata già in produzione.

## Fix applicati dopo la review formale (wm-review-ticket)

- **`resume()` non ripristinava `setMapDetailsStatus({status:'onlyTitle'})`** dopo una pausa in cui l'utente avesse riaperto un pannello di dettaglio (che `map-details.component.ts` forza sempre a `'open'`) — aggiunto lo stesso dispatch già presente in `recordStart()`.
- **Logica del view-model duplicata tra `track-recorder.component.ts` e `tab-detail.component.ts`** — estratta in un nuovo selettore condiviso `trackLiveDistanceVm` (con l'interfaccia `TrackLiveDistanceVm`) in `user-activity.selector.ts` (wm-core); entrambi i componenti ora si limitano a `this._store.select(trackLiveDistanceVm)`.
- **Classi CSS morte** (`wm-recorder-action-btn-resume/pause/stop/waypoint`, residuo della colorazione poi annullata) rimosse dal template — resta solo `wm-recorder-action-btn`.
- **`*ngIf="trackLiveDistanceVm$|async as liveDistance"` non avvolge più il cronometro centrale** — ristretto alle sole due colonne laterali, così il timer di registrazione (funzionalità sempre presente) non dipende più dall'emissione dei 4 selettori usati per i badge (funzionalità secondaria/gated).
- **Chiave i18n orfana `pages.register.time`** rimossa da tutti i 7 file di lingua (non più referenziata da nessun componente dopo la rimozione dell'etichetta "IN MOVIMENTO").
- Aggiunto un commento in `track-recorder.component.html` che spiega esplicitamente perché le chiavi i18n `from`/`to` (globali) convivono con le chiavi scoped `pages.register.*` nello stesso file — scelta deliberata di riuso, non un'incoerenza involontaria.
- **Non modificato**: l'`@Input() showSuffix: boolean` su `WmTrackLiveDistanceBadgeComponent` resta booleano (non generalizzato a `suffix: string|null`) — la review lo segnalava come debito silente accettabile per due soli consumer attuali, non un problema da risolvere in questo ciclo.

## Follow-up

- Isolare e correggere alla radice il bug `averageSpeed → Infinity` in `GeoutilsService` (ticket separato).
- Verificare se `--wm-color-danger`/`--wm-color-warning` sono referenziate altrove nel codice come variabili mai definite (audit da fare, non eseguito in questo ciclo).
- Verifica visiva manuale su device reale a 412×832 e su schermo più grande resta a carico dello sviluppatore (non eseguibile in autonomia in questa sessione) — build/type-check automatici verdi, ma nessuna verifica automatica sostituisce l'occhio umano per il redesign.
- Se in futuro un terzo consumer di `WmTrackLiveDistanceBadgeComponent` necessitasse di un suffisso diverso da "da te" (non solo assente/presente), generalizzare `showSuffix: boolean` a `suffix: string|null`.
