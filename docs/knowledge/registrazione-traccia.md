# Il box di registrazione di una traccia

## Come funziona oggi

La plancia aperta di `wm-track-recorder` (plancia-registrazione-riducibile, variante «compatta con avanzamento» dello studio di design) mostra in alto il tempo, la velocità attuale e la media. Sotto c'è una barra di avanzamento sulla traccia ufficiale selezionata, con i badge di distanza dalla **partenza** e dall'**arrivo**. In fondo ci sono i comandi: pausa/riprendi, salva, waypoint e «riduci». I valori della barra vengono dai selettori di `wm-core` (`trackLiveDistanceVm`: `distanceCovered`, `remainingDistance`, `stale`): nessun calcolo nuovo, nessuno stato dedicato alla registrazione.

Barra e badge compaiono solo se c'è una traccia selezionata in quel momento. Nessuna persistenza, nessun «pin»: chiudendo il pannello di dettaglio spariscono.

Durante la registrazione la plancia si **riduce** a una linguetta attaccata al bordo destro, in alto (plancia-registrazione-riducibile). La linguetta ha due righe:
- la prima mostra il tempo, sempre fisso;
- la seconda mostra un'informazione scelta scorrendo su e giù: con una traccia Arrivo (predefinita), Partenza, Km percorsi, Velocità, Media; senza traccia Km percorsi (predefinita), Velocità, Media.

La scelta vale per la registrazione in corso. Selezionando una traccia si passa ad Arrivo, togliendola da Arrivo o Partenza si passa a Km percorsi. In pausa la seconda riga diventa «In pausa». Un tocco senza scorrimento riapre la plancia; il passaggio fra plancia e linguetta è animato (solo dissolvenza con `prefers-reduced-motion`).

Camminando, la plancia aperta si riduce **da sola** alla linguetta (oc:8798): quando sono passati almeno 15 s (`AUTO_MINIMIZE_MS`) da un punto di partenza e l'ultimo punto tenuto dalla pulizia GPS (`recordedKeptLocations$` di `wm-core`) dista dalla posizione di partenza almeno 20 m (`AUTO_MINIMIZE_M`) e più dell'accuratezza peggiore fra i due punti. Il punto di partenza si rifissa all'avvio, alla riapertura dalla linguetta, alla ripresa dopo la pausa e a ogni tocco sulla plancia aperta, bottoni compresi. Contano solo i punti nuovi. In pausa la riduzione automatica è sospesa; la riapertura resta solo manuale. Vale per tutti gli shard, senza interruttore in config.

La plancia pubblica in `RecorderPanelLayoutService` dove finisce l'elemento visibile, plancia o linguetta, misurato con un `ResizeObserver`; l'avviso GPS lo legge per stare sotto (vedi la pagina [8766](8766-mappa-indicazione-di-segnale-gps-scarso-posizione-non-disponibile-o-poco-affidabile.md)). Con il dettaglio della mappa aperto la plancia parte da 64px a sinistra per lasciare libero il bottone «indietro» del dettaglio (`detailsOpen`, da `map.page.html`).

`recordStart()` e `resume()` chiamano `minimizeOpenMapDetails()` (`src/app/functions/minimize-open-map-details.ts`): all'avvio o alla ripresa della registrazione un pannello aperto (`open` o `full`) si riduce al titolo invece di restare espanso sopra la mappa, **senza** azzerare `currentEcTrack` — quindi le distanze restano disponibili. Un pannello chiuso (`background`) resta chiuso: fino a oc:8762 il dispatch era incondizionato e lo faceva apparire. La stessa funzione la usa il bottone «Inizia il cammino».

Su camminiditalia (oc:8762) la registrazione parte dal bottone «Inizia il cammino» (`webmapp-btn-start-walk`) **senza lo slider** «scorri per registrare»: il bottone chiama `startRecording()` prima di aprire il pannello, e il recorder, montandosi con `onRecord` già vero, mostra subito il tempo. Lì il fab che si apriva su traccia e POI è sostituito dal solo fab del POI (`webmapp-btn-add-poi`); sugli altri shard il fab resta, con lo slider. Bottone, fab del POI e fab di default passano dal login con `loginIfNeeded()` (`src/app/functions/login-if-needed.ts`), che dopo un login riuscito esegue l'azione senza un secondo tocco: `LoginComponent` chiude la modale senza dati, quindi l'esito si rilegge dallo store.

Distanza e velocità media della plancia, e distanza, tempo e dislivello del riepilogo dopo il salvataggio (`modal-success`), vengono da `wm-core` (`computeUgcTrackLocalStats`, `UgcTrackStatsService`) e sono calcolati sui soli punti tenuti dalla pulizia GPS, la stessa del server: l'app non ha più un calcolo suo. La velocità attuale resta quella del GPS grezzo, e il timer è il cronometro, che esclude le pause. Il dettaglio sta in `wm-core`, `docs/knowledge/8743-app-dettagli-tecnici-e-mappa-delle-tracce-ugc-dai-dati-del-server-calcolo-al-volo-con-la-stessa-pulizia-gps-se-non-sincronizzate.md`.

Scartare una registrazione appena conclusa — «ESCI SENZA SALVARE» o «Elimina registrazione» nella modale di salvataggio (`ModalSaveComponent`) — chiede conferma con l'alert «Elimina per sempre?» (`pages.register.modalexit.*`, nei file i18n dell'app), poi cancella solo i punti in locale (`removeCurrentUgcTrackLocations()`): la traccia non è mai arrivata al server. Per i POI (`isWaypoint`) l'alert non compare. L'eliminazione di una traccia già salvata è un altro flusso, in `wm-core` (`ugc-track-properties-base.component.ts`), con un testo suo.

## Perché così

- **I due badge non sono «km percorsi»** (oc:8284), ed è la confusione da evitare: misurano la posizione GPS corrente proiettata sulla traccia ufficiale, non quanto è stato camminato in questa sessione. `length`, la riga già esistente, è il dato della registrazione reale.
- **`showSuffix` è un `@Input()` nuovo sul badge condiviso** (oc:8284, `wm-core`): a `false` il badge mostra solo la distanza, senza «da te», ridondante qui dove l'etichetta dice già PARTENZA o ARRIVO. Il default resta `true` per non toccare l'uso esistente.
- **Nessuna nuova scala tipografica né nuove chiavi i18n** (oc:8284): le etichette riusano `from`/`to`, già introdotte da oc:8177.
- **La riduzione a linguetta invece dello spostamento libero** (plancia-registrazione-riducibile): il problema era la mappa coperta durante il cammino. Trascinare la plancia si scontra con il pan della mappa e con i fab già sul lato sinistro; il bordo destro in alto è l'unica zona libera.
- **Il bottone «indietro» fuori dal DOM durante la registrazione** (plancia-registrazione-riducibile): a opacità 0 restava cliccabile e chiudeva la registrazione senza la modale di salvataggio.
- **Lo scorrimento della linguetta è verticale** (plancia-registrazione-riducibile): su Android, con la navigazione a gesti, trascinare dal bordo destro è il gesto «indietro» del sistema, e la linguetta sta proprio lì.
- **La velocità media della linguetta non usa `analytics-outline`** (plancia-registrazione-riducibile): è l'icona della registrazione.
- **Plancia e riepilogo leggono i valori da `wm-core`** (oc:8743): con la copia di `GeoutilsService` dell'app, che usava tutti i punti, la stessa traccia poteva mostrare numeri diversi in plancia, riepilogo e pannello. La copia è stata eliminata.
- **Si riduce da sola, si riapre solo a mano** (oc:8798): deciso allo scrum del 19/10/2026, perché chi cammina guarda la mappa. La riapertura automatica alla sosta è stata scartata: il GPS riconosce la sosta in ritardo e da fermi la posizione oscilla.
- **Spostamento netto da un punto fisso, non velocità** (oc:8798): la velocità istantanea del GPS è il dato più disturbato, e da fermi, con un segnale che oscilla, può risultare diversa da zero; lo spostamento netto filtra l'oscillazione. Soglie corte (15 s, 20 m) al posto del minuto di movimento del concetto di partenza, perché la mappa resti coperta il meno possibile.
- **Oltre l'accuratezza peggiore dei due punti** (oc:8798): sul web non c'è il filtro dei 10 m del nativo e arriva circa un punto al secondo; all'avvio il primo punto, che fa da partenza, è spesso il meno preciso. Guardare solo l'ultimo punto faceva ridurre la plancia da fermi.
- **Il tocco fa ripartire il conteggio** (oc:8798): un contenuto che cambia da solo si sospende mentre l'utente ci interagisce, e così è meno probabile che la plancia sparisca mentre l'utente sta per toccare un bottone.
- **«dai nostri server» nella conferma di scarto, non il nome di un brand** (oc:8808): la stringa di default è comune a tutte le istanze. Il testo non descrive alla lettera l'operazione (la traccia è solo sul dispositivo): è stato proposto «la registrazione verrà eliminata» ed è stato scelto di restare su questa formulazione. Un cliente che volesse un testo suo può averlo con l'override `TRANSLATIONS` della config, senza toccare il default.

## Cosa è stato provato e ritirato

Tre iterazioni su device reale hanno **annullato** buona parte di un primo restyling (oc:8284), e vale la pena saperlo prima di riproporlo:

- **Colore semantico per-azione sui tre pulsanti**: introdotto e poi ripristinato al neutro originale su richiesta esplicita. È rimasta solo la forma circolare 38×38px.
- **Icone direzionali accanto a PARTENZA/ARRIVO**: rimosse dopo la prima iterazione, troppo rumore visivo.
- **L'etichetta «IN MOVIMENTO» è stata eliminata**, non rinominata: resta il solo timer. La chiave `pages.register.time` è orfana e lasciata nei file di lingua.
- **Il blocco centrale è sceso da 23px a 21px**: con le colonne laterali affiancate risultava troppo dominante.
- **La «flex sandwich»** (oc:8284, superata da plancia-registrazione-riducibile): due colonne laterali `flex:1` sempre presenti tenevano il tempo centrato con e senza badge. Il nuovo design mette il tempo a sinistra e partenza/arrivo nella barra di avanzamento.

Nello studio di design della plancia riducibile (artifact «Plancia di registrazione») sono stati scartati:
- il pallino e la pillola come forma ridotta, a favore della linguetta;
- la barretta di presa sulla linguetta, e i puntini messi al suo posto, perché sembravano riferirsi anche al tempo;
- lo scorrimento orizzontale, per il gesto «indietro» di Android;
- `contract-outline` e le due frecce opposte come icona «riduci», perché si leggono come «espandi»; resta la freccia verso l'angolo in alto a destra, dove compare la linguetta.

Per la riduzione automatica (oc:8798) sono stati scartati, in fase di analisi, il criterio sulla velocità GPS sopra una soglia per un tempo continuo e la soglia di un minuto del concetto di partenza; vedi «Perché così».

La riorganizzazione della plancia aperta con i km percorsi vicino agli altri valori, invece che accanto ai pulsanti, è stata studiata e rimandata.
