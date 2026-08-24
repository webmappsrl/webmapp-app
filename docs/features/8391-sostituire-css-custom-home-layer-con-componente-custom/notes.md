> Ticket: oc:8391

# Notes — Sostituire CSS custom home-layer con componente custom (camminiditalia)

## Deviazioni dal piano

- **Task 6 (rimozione blocco CSS da `1.css`/`1.css` dev) eseguito prima del Task 5**,
  su richiesta esplicita del developer per poter testare in locale la
  variante camminiditalia senza il vecchio CSS in mezzo. Il contenuto finale
  dei due file coincide esattamente con quanto specificato nel piano — solo
  l'ordine è anticipato, non il contenuto.
- **Task 5 (`fileReplacements` in `core/angular.json`) aggiunto SOLO nel
  working tree locale, per test manuale in dev server — NON incluso nei
  commit di questo giro**. La precondizione bloccante del piano (submodule
  wm-core bumpato a un commit che include `home-layer.component.camminiditalia.ts`)
  non è ancora soddisfatta al momento di questi commit. Verrà aggiunto in un
  commit/PR separato solo dopo che la PR wm-core sarà mergiata e il
  submodule bumpato.
- **`@Injectable()` aggiunto a `WmHomeLayerBaseComponent`** (Task 1) — non
  previsto nel codice originale del piano. Scoperto un bug reale (`NG0202`,
  Angular Dependency Injection) testando l'app in un browser reale dopo
  l'implementazione: senza decorator Angular sulla classe Base, il
  compilatore non genera la factory DI (`ɵfac`) da cui le sottoclassi
  ereditano i parametri del costruttore. Non rilevato dagli spec Karma
  (che istanziano il componente con `new`, bypassando Angular DI) — solo
  dal test manuale in dev server. Aggiunta anche una guardia di regressione
  (`home-layer-base.component.spec.ts`, verifica che `ɵfac` sia definito).
- **Stile grid della variante camminiditalia (Task 3) diverso dal codice
  letterale del piano**: `border-radius`/`background`/`overflow` spostati
  dai figli (`.wm-img-image`, `.wm-box-title`) al contenitore
  `wm-home-layer > wm-img`, con angoli arrotondati su tutti e 4 i lati e un
  unico sfondo bianco invece di due sfondi separati. Richiesto dal developer
  dopo aver visto il risultato visivo del porting letterale (angoli
  inferiori squadrati, sfondo bianco non omogeneo dietro logo+titolo).
- **Cleanup post-review** (`wm-skills:wm-review-ticket oc:8391`, 5 finder
  paralleli): estratto `home-layer-shared.scss` (regole host comuni,
  prima duplicate 1:1 tra default e variante), estratto
  `home-layer-favorite.spec-support.ts` (suite di test condivisa, prima
  duplicata 1:1), rimosso `home-layer.component.camminiditalia.html`
  (duplicato byte-identico del default — la variante ora punta allo stesso
  `templateUrl` del default, dato che solo il `.ts` deve essere gemello per
  `fileReplacements`).

## Bug trovati

- **`NG0202` a runtime** (Angular DI) sulla Base senza `@Injectable()` — vedi
  sopra. Trovato solo con test manuale in browser, non dagli spec Karma
  esistenti (limite già segnalato in Fase: challenge, qui materializzato
  concretamente).

## Decisioni

- **Pattern Base+estensione trattato come validazione, non come nuova policy
  definitiva**: in controtendenza rispetto al precedente documentato in
  `CLAUDE.md` (scartato due volte su `home.component.ts`/`profile.page.ts`).
  Qui giustificato perché la logica TS tra default e variante è identica al
  100%. Se il vantaggio DRY si confirma nell'uso reale, valutare in un
  ciclo futuro se promuoverlo a raccomandazione generale.
- **Criterio "livello di replace" (foglia vs genitore) formalizzato subito in
  `CLAUDE.md` del repo principale, non rimandato a questo file** — a
  differenza del pattern Base (che richiede validazione), questo criterio è
  generale e indipendente dall'esito di quella validazione: deciso durante
  la sessione su richiesta esplicita del developer. L'overview.md del repo
  principale è stato corretto per riflettere questo (diceva inizialmente
  "resta osservazione in notes.md").
- **Rischio non completamente verificato**: il nuovo `overflow:hidden` sul
  contenitore grid (`wm-home-layer > wm-img`) potrebbe clippare il
  cuoricino preferiti (`.wm-home-layer-favorite`, `position:absolute;
  top:8px;right:8px`), segnalato da 3 finder indipendenti nella review
  formale. Non ancora verificato visivamente con un utente loggato e
  preferiti attivi (l'unica verifica visiva fatta finora non aveva quella
  condizione attiva). Vedi Follow-up.

## Follow-up

- **Verificare visivamente il cuoricino preferiti** su un layer con logo,
  da utente loggato con `OPTIONS.showFavorites` attivo, per escludere il
  clipping da `overflow:hidden` sul contenitore grid.
- **Task 5 ancora da completare**: aggiungere l'entry `fileReplacements` in
  `core/angular.json` (repo principale) SOLO dopo che questa PR wm-core sia
  mergiata e il submodule sia bumpato — vedi vincolo di sequenza in
  `overview.md`.
- Dopo il completamento del Task 5, eseguire una build reale
  (`ng build --configuration=camminiditalia`) per la verifica prevista dal
  piano (Task 5, Step 2) — finora validato solo con `ng serve` +
  navigazione manuale in browser, non con un build di produzione.
- **`## Feature disponibili` non ancora aggiornato** in nessuno dei due
  `CLAUDE.md` — la feature non è ancora end-to-end (manca il Task 5). Da
  aggiungere solo quando la seconda PR (repo principale, con
  `fileReplacements`) sarà pronta.
- Rivalutare se promuovere il pattern Base+estensione a raccomandazione
  generale in `CLAUDE.md` (repo principale), una volta osservato l'esito
  reale di questo ciclo (vedi "Decisioni" sopra).
