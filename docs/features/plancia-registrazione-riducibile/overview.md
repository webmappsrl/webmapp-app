# Plancia di registrazione riducibile

## Cosa cambia

Durante la registrazione di una traccia la plancia in alto sulla mappa (`wm-track-recorder`) si può
**ridurre** a un elemento piccolo agganciato al bordo destro dello schermo, che mostra il tempo, una
distanza e lo stato di pausa. Resta lì finché l'utente non lo tocca per riaprire la plancia intera.

La plancia aperta resta fissa in alto, come oggi, ma con un **design rivisto** per essere più
leggibile all'aperto.

L'avviso sullo stato del GPS (`webmapp-gps-alert`, oc:8766), che oggi si sovrappone alla parte bassa
della plancia, **compare subito sotto la plancia quando questa è aperta**; quando è ridotta, o
quando non si registra, resta nella posizione attuale.

## Perché

La plancia aperta copre la parte alta della mappa per tutta la durata della registrazione, cioè
proprio mentre l'utente segue il percorso. Ridurla libera la mappa senza perdere di vista le due
informazioni che servono camminando: da quanto si è in cammino e quanta strada si è fatta o manca.

L'avviso GPS ha un `top` fisso (safe-area + 72px) che non tiene conto della plancia: con la
registrazione attiva copre velocità e km, cioè le informazioni che l'avviso stesso invita a
controllare.

## Requisiti

### Riduzione
- [ ] La plancia aperta ha un comando per ridursi; l'elemento ridotto ha un comando (il tocco
  sull'elemento intero) per riaprirla. Nessuna delle due azioni richiede un trascinamento.
- [ ] L'elemento ridotto sta di default sul **bordo destro, in alto**, appena sotto la barra di
  stato (rispettando `env(safe-area-inset-top/right)`), e non si sovrappone né ai fab in alto a
  sinistra né al badge GPS in basso a destra. Posizione e forma definitive si decidono nello studio
  di design.
- [ ] L'elemento ridotto mostra:
  - il **tempo** del cronometro (esclude le pause, come oggi);
  - i **km percorsi** (`length`), oppure — se c'è una traccia ufficiale selezionata — la
    **distanza dall'arrivo** (`trackRemainingDistance`), distinta da un'icona o etichetta, così da
    non confonderla con i km percorsi;
  - un **indicatore di stato**: in registrazione / in pausa, riconoscibile senza leggere il testo.
- [ ] La distanza dell'elemento ridotto usa il **badge di distanza già esistente** di wm-core, con
  `[stale]`, così una posizione non aggiornata è segnalata come nella plancia aperta.
- [ ] Quando la distanza dall'arrivo diventa `null` (dettaglio della traccia chiuso, opzione
  `showTrackRemainingDistance` spenta) e l'elemento passa ai km percorsi, cambia anche icona o
  etichetta: il valore non cambia significato in silenzio.
- [ ] **In pausa** l'elemento ridotto cambia aspetto in modo evidente, non solo con un'icona (es. tempo
  che lampeggia piano, «In pausa» al posto della distanza): chiudere la modale di salvataggio senza
  scegliere lascia la registrazione in pausa (`track-recorder.component.ts:186-211`).
- [ ] L'elemento ridotto ha una larghezza massima e il testo non va a capo, anche con i caratteri
  ingranditi dalle impostazioni del telefono e con tempi `hh:mm:ss`.
- [ ] Il cronometro e i valori continuano ad aggiornarsi mentre la plancia è ridotta, e alla
  riapertura la plancia mostra i valori correnti (nessun reset).
- [ ] Lo stato ridotto/aperto vale per la registrazione in corso; una nuova registrazione parte con
  la plancia aperta.
- [ ] Alla fine della registrazione (stop o salvataggio) l'elemento ridotto sparisce come oggi
  sparisce la plancia.

### Linguetta: informazione a scelta (aggiunto dopo la prova su dispositivo)

Variante **D** della tavola «Linguetta: scegli l'informazione scorrendo» dell'artifact.

- [ ] La seconda riga della linguetta mostra **una informazione alla volta**, scelta dall'utente
  **scorrendo su e giù** sulla linguetta. Il tempo, sulla prima riga, resta sempre fisso.
- [ ] Le informazioni disponibili sono:
  - **con una traccia selezionata** (`remainingDistance` non nullo): Arrivo (predefinita), Partenza,
    Km percorsi, Velocità, Velocità media;
  - **senza traccia**: Km percorsi (predefinita), Velocità, Velocità media.
- [ ] Aspetto della variante D:
  - la riga è separata dal tempo da un filo sottile;
  - sopra c'è un'etichetta piccola in maiuscoletto;
  - sotto c'è il valore, più grande, con la sua icona;
  - a lato ci sono i puntini verticali, uno per informazione, con evidenziata quella mostrata.
  
  La barretta di presa sul lato sinistro viene tolta.
- [ ] **Gesto**:
  - uno scorrimento verticale di almeno 16px cambia l'informazione: verso l'alto la successiva,
    verso il basso la precedente;
  - lo scorrimento si ferma alla prima e all'ultima informazione, senza ricominciare dal giro;
  - un tocco senza scorrimento (meno di 8px) riapre la plancia, come oggi;
  - uno scorrimento non riapre mai la plancia.
- [ ] **Animazione**: il cambio fa scorrere la riga per 220ms. Con `prefers-reduced-motion` il cambio
  è immediato.
- [ ] **Durata della scelta**: vale per la registrazione in corso e resta valida anche riducendo e
  riaprendo la plancia. Una nuova registrazione riparte dall'informazione predefinita.
- [ ] **Traccia selezionata o deselezionata durante la registrazione**:
  - quando si seleziona una traccia, la linguetta passa ad Arrivo;
  - quando la traccia viene tolta e l'informazione scelta era Arrivo o Partenza, la linguetta passa
    a Km percorsi;
  - le altre informazioni scelte restano.
- [ ] **Valori mostrati**:
  - Arrivo e Partenza usano il badge di distanza di wm-core con `stale`, come oggi;
  - Km percorsi mostra `length`;
  - Velocità mostra `actualSpeed`;
  - Velocità media mostra `averageSpeed`.
  
  Un valore non calcolabile mostra «—».
- [ ] **In pausa** la riga mostra «In pausa» come oggi, e lo scorrimento non cambia l'informazione.
- [ ] Le etichette riusano chiavi i18n esistenti: `to`, `from`, `pages.register.odo`,
  `pages.register.currentspeed`, `pages.register.averagespeed`. Nessuna chiave nuova.
- [ ] [UX] Etichetta lunga (es. «Velocità attuale» o una traduzione): si accorcia con «…», il valore
  non si tronca mai.
- [ ] [UX] Il lettore di schermo non può scorrere: l'etichetta accessibile della linguetta resta
  «Apri la plancia di registrazione», e la plancia aperta mostra comunque tutti i valori.

### Redesign della plancia aperta
- [ ] Nuovo design della plancia aperta, più leggibile all'aperto, che può superare le scelte
  ritirate in oc:8284 (colore per azione, dimensioni del blocco centrale…) ma **con pochi colori**.
- [ ] Il redesign mantiene i badge di distanza da **partenza** e **arrivo**, che compaiono solo con
  una traccia selezionata, e il tempo resta centrato sia con i badge sia senza.
- [ ] Il redesign mantiene i tre comandi attuali: pausa/riprendi, salva, waypoint.

### Bottone «indietro» della plancia
- [ ] Durante la registrazione il bottone «indietro» (`wm-track-recorder-close-btn`) viene **tolto dal
  DOM** (`*ngIf` su `onRecord`), non solo reso trasparente. Oggi resta cliccabile a opacità 0 e chiude
  la registrazione senza la modale di salvataggio (`track-recorder.component.html:1-11`,
  `track-recorder.component.ts:148-163`); con la plancia ridotta quell'angolo diventerebbe mappa
  libera. Prima della registrazione, con lo slider, resta com'è oggi.

### Avviso GPS
- [ ] La plancia è **aperta** quando la registrazione è attiva (`onRecord` vero, anche in pausa) e non
  è ridotta. Prima dello slider la plancia è montata ma trasparente, e non conta come aperta.
- [ ] Con la plancia **aperta**, la scheda dell'avviso compare subito sotto la plancia, con un
  margine fisso, leggendo l'altezza reale della plancia (che cambia con i badge e con il redesign),
  non un secondo valore fisso.
- [ ] Il collegamento passa da un **servizio dell'app** che espone il bordo inferiore dell'elemento
  visibile — plancia aperta **o linguetta** — oppure nulla: la plancia lo aggiorna con un
  `ResizeObserver` su entrambi, l'avviso lo legge. Plancia e avviso non sono imparentati nel
  template (`map.page.html:208` e `:224`).
- [ ] Con la plancia **ridotta**, l'avviso sta 8px sotto la linguetta ma **mai più in alto** di oggi
  (safe-area + 72px): nel caso normale resta dove sta oggi, scende solo se la linguetta cresce (es.
  caratteri ingranditi). La linguetta finisce a circa 115px, a 4px dall'avviso.
- [ ] Senza registrazione attiva l'avviso resta dove sta oggi (safe-area + 72px).
- [ ] Se la plancia si apre o si riduce mentre l'avviso è visibile, l'avviso si riposiziona.
- [ ] Il volo dell'avviso di segnale debole verso il badge continua a funzionare, partendo dalla
  posizione corrente della scheda.

### Studio di design
- [ ] Prima dell'implementazione, un artifact mette a confronto più varianti di elemento ridotto
  (forma, posizione, contenuto con e senza traccia selezionata, in pausa) e di plancia aperta
  ridisegnata, compreso il caso con l'avviso GPS sotto la plancia. L'implementazione parte dalla
  variante scelta dal dev.

### [UX]
- [ ] [UX] Bersagli toccabili di almeno 44pt (iOS) / 48dp (Android), anche per l'elemento ridotto:
  si usa all'aperto, con una mano, a volte con i guanti.
- [ ] [UX] Comandi di riduzione e riapertura con un'etichetta accessibile (`aria-label`) statica
  (es. «Apri la plancia di registrazione»), senza regione `aria-live` sul tempo: il lettore di schermo
  ripeterebbe il cronometro ogni secondo.
- [ ] [UX] Passaggio aperto/ridotto animato in modo breve, così si capisce da dove viene l'elemento
  e dove è finita la plancia; rispettare `prefers-reduced-motion`.
- [ ] [UX] Contrasto dei testi di almeno 4.5:1 sopra la mappa, che ha sfondi molto variabili.

### Testi
- [ ] Ogni testo nuovo (es. le etichette accessibili) va in `core/src/assets/i18n/` in tutte e sette
  le lingue (it, en, fr, de, es, pr, sq), con la chiave uguale al testo italiano.

## Rischi

- **Trappole già note sull'avviso** (`.claude/rules/avvisi-gps.md`): l'host è nello slot `fixed` di
  `ion-content` e posiziona la scheda in `absolute`; l'animazione di volo usa `fill: 'forwards'` e
  riscrive `top` in linea (`gps-alert.component.ts:164`), quindi l'animazione va annullata prima di
  riposizionare la scheda.
- **Sovrapposizioni dell'elemento ridotto**: il lato sinistro è occupato (tasto indietro, fab, zoom)
  e il basso a destra dal badge GPS; il bordo destro in alto è l'unica zona libera, da verificare su
  schermi piccoli e con il notch.
- **Il redesign ripercorre un terreno già battuto**: oc:8284 ha annullato buona parte di un primo
  restyling dopo tre prove su un dispositivo reale. Lo studio nell'artifact e la verifica su
  dispositivo servono a non rifare lo stesso giro.
- **Redesign e riduzione toccano gli stessi file**, e sull'app nativa ogni correzione passa da una
  release negli store. Mitigazione: tre commit distinti, in quest'ordine — (1) bottone «indietro»
  fuori dal DOM, (2) riduzione e avviso tramite il servizio, (3) redesign — così il redesign si
  annulla da solo con un `git revert` e la riduzione si verifica sulla plancia di oggi.
- **Distanza dall'arrivo vecchia o che cambia significato** sull'elemento ridotto: mitigata dal badge
  esistente con `stale` e dal cambio di icona/etichetta (vedi Requisiti).
- **Pausa inosservata** con la plancia ridotta: mitigata dall'aspetto evidente in pausa.

## Out of scope

- **Spostamento libero** della plancia aperta: resta fissa in alto.
- **Spostamento dell'elemento ridotto** lungo il bordo: rivalutabile dopo lo studio di design, non in
  questo ciclo.
- **Avviso di assenza di rete internet**: oggi non esiste un avviso di rete sulla mappa
  (`NetworkService.online$` di wm-core non mostra nulla); è un lavoro a sé.
- **Persistenza dello stato ridotto** fra registrazioni diverse o riavvii dell'app.
- **Modale di salvataggio chiusa senza scelta**, che lascia la registrazione in pausa: difetto a
  parte, qui si rende solo evidente la pausa.

## Moduli toccati

Tutto nel repo dell'app (`webmapp-app`), nessun submodule:

- `core/src/app/components/track-recorder-component/track-recorder.component.{html,scss,ts}` —
  stato ridotto/aperto, elemento ridotto, redesign, esposizione dell'altezza della plancia aperta.
- `core/src/app/components/shared/gps-alert/gps-alert.component.{scss,ts}` — posizione della
  scheda sotto la plancia aperta.
- Un servizio nuovo dell'app (es. in `core/src/app/services/`) — dove finisce la plancia aperta,
  scritto dalla plancia e letto dall'avviso.
- `core/src/app/pages/map/map.page.html` — solo se serve per il montaggio. Lo shard camminiditalia
  usa lo stesso template (`map.page.camminiditalia.ts:13`).
- `core/src/assets/i18n/{it,en,fr,de,es,pr,sq}.ts` — eventuali testi nuovi.
- `docs/knowledge/registrazione-traccia.md` e `docs/knowledge/8766-…md` — aggiornamento a fine lavoro.
