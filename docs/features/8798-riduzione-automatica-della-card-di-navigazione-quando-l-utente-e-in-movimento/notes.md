> Ticket: oc:8798

# Notes — Riduzione automatica della card di navigazione quando l'utente è in movimento

## Divergenze dal piano, task per task

### Task 1: haversineMeters al posto di distanceBetweenPoints

Il piano indicava `distanceBetweenPoints` di `map-core` (`utils/ol.ts`). È stata usata
`haversineMeters` di `wm-core` (`utils/ugc-track-stats.ts`): è la stessa distanza della pulizia GPS
che decide i punti tenuti, e il componente importava già da quel file. Nessun import nuovo da
`map-core`.

### Task 2: riapertura, ordine e test

- In `expand()` il punto di partenza si rifissa **prima** di `_toggle`, non dopo: la transizione
  dura 300 ms e un punto arrivato nel frattempo non deve essere confrontato con la partenza vecchia.
- Il test «dopo la riapertura riparte e riduce di nuovo», scritto come nel piano, passava già senza
  implementazione (la partenza vecchia e la riapertura cadevano nello stesso istante): è stato
  aggiunto un `tick(60000)` prima di `expand()`.
- I test su avvio e ripresa chiamano `minimizeOpenMapDetails`, che legge `mapDetailsStatus`: il
  selettore è stato aggiunto al mock dello store (`'background'`). Dopo il fix i due test sono stati
  verificati in rosso togliendo temporaneamente la ripartenza da `resume()` e `recordStart()`.
- Aggiunto un test in più rispetto al piano: il tocco su un bottone della plancia
  (`e2e-recorder-waypoint-btn`) fa ripartire il conteggio, perché il `pointerdown` risale.

## Bug trovati

- Review finale (I1): il controllo sull'accuratezza guardava solo l'ultimo punto, come chiedeva
  l'overview. All'avvio la partenza è spesso il punto meno preciso, e da fermi, col fix che
  migliora, la plancia si riduceva. Ora lo spostamento deve superare l'accuratezza peggiore fra
  partenza e ultimo punto; test «non riduce entro l'accuratezza del punto di partenza», rosso poi
  verde, suite 176/176. Overview aggiornata (modifica richiesta a posteriori).
- `npm run lint` non parte nel repo, indipendentemente da questo lavoro: ESLint 9 non riesce a
  caricare `plugin:@angular-eslint/ng-cli-compat` referenziato da `core/.eslintrc.json`. Il lint dei
  file toccati non è stato quindi eseguito.

## Decisioni

- Review formale (`wm-review-ticket`, 22/10/2026, modifiche non ancora committate): APPROVATO CON
  RISERVE, nessun bloccante. Il dev ha scelto di non correggere i cleanup in questo ciclo: restano
  qui sotto fra i follow-up.
- Suite completa: da 160 a 176 test (16 nuovi in `track-recorder.component.spec.ts`, tutti
  nella suite completa, non solo con `--include`).

- Tag Orchestrator: il dev ha scelto di saltare sia i tag di ambiente sia quelli di contenuto.
- Eventi PostHog sulla riduzione e sulla riapertura: proposti in challenge, rifiutati dal dev
  («per ora abbastanza inutili»).
- Accessibilità con lettore di schermo (focus dentro la plancia): proposto in challenge, ritenuto
  non plausibile dal dev; nessun controllo sul focus.
- Il tempo si misura con `Date.now()`; `location.time` serve solo a riconoscere un punto nuovo.

## Follow-up

- Minori dalla review finale, non corretti:
  - il punto nuovo si riconosce dall'ora: un ricalcolo della pulizia GPS che riemette un ultimo
    punto più vecchio (config arrivata dopo una ripresa, parametri diversi) conta come nuovo;
    correzione: confronto per riferimento e scarto dei punti con ora non successiva;
  - un solo punto anomalo basta a ridurre la plancia: eventualmente richiedere due punti
    consecutivi oltre le soglie;
  - dopo un riavvio dell'app la partenza è l'ultimo punto salvato: se l'utente si era spostato, la
    plancia si riduce anche da fermo;
  - `this.minimize()` è una promise non gestita (`void`).
- Cleanup dalla review formale, non corretti per scelta del dev:
  - se il primo fix GPS arriva dopo più di 15 s dall'avvio, l'istante di partenza resta quello
    dell'avvio e la plancia si riduce al primo punto oltre 20 m: fissare anche l'istante quando
    arriva il primo punto;
  - con il pannello waypoint aperto la plancia sotto può ridursi: da decidere se è voluto;
  - riconoscere il punto nuovo per riferimento invece che per ora, anche per i punti senza `time`;
  - documentare in `wm-core` le due invarianti su cui si appoggia il componente (l'ultimo punto
    tenuto è sempre buono; lo stream emette solo quando la pulizia decide un punto);
  - `recordStart` dipende dall'ordine `startRecording()` → `_resetAutoMinimize()`;
  - estrarre il criterio in una funzione pura in `src/app/functions/`;
  - alias `WmLocation` per il tipo `Location`, lettura dell'ultimo punto duplicata;
  - nello spec: costante per `111195`, soglie come costanti, virgolette, test sulla riemissione e
    sul tocco del bottone più diretti.
- Chi vuole tenere la plancia sempre aperta oggi non può: se arrivano lamentele, l'intervento meno
  invasivo è smettere di ridurre in automatico per il resto della registrazione dopo due o tre
  riaperture manuali.
- Sistemare la configurazione ESLint dell'app (vedi «Bug trovati»).
- Prova manuale sul campo per confermare 15 s e 20 m.
