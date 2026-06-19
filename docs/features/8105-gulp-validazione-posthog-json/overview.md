> Ticket: oc:8105

# Gulp: validazione posthog.json prima della build

## Cosa cambia

Il gulpfile aggiunge, all'inizio della funzione `build()`, una validazione esplicita di `instances/posthog.json`. Se il file non esiste o una delle chiavi obbligatorie (`POSTHOG_KEY`, `POSTHOG_HOST`) è mancante o vuota (dopo `.trim()`), la build si interrompe subito con un messaggio guidato su console. Dopo la fase `create()`, il file viene copiato in `instances/<instanceName>/posthog.json` per renderlo disponibile al compilatore TypeScript.

## Perché

L'app importa `posthog.json` in `app.module.ts` (`import posthogConfig from '../../../posthog.json'`). Se i valori sono assenti, PostHog viene inizializzato con credenziali vuote e l'analytics smette di funzionare silenziosamente in produzione. Attualmente il gulp non valida il file e l'errore emerge solo a compile time con un messaggio criptico.

## Requisiti

- [ ] Se `instances/posthog.json` non esiste, la build fallisce immediatamente con errore esplicito
- [ ] Se il file esiste ma il JSON non è valido (parsing error), la build fallisce con messaggio che indica il percorso del file e il dettaglio dell'errore di parsing
- [ ] Se `POSTHOG_KEY` è mancante o vuota (dopo `.trim()`), la build fallisce con messaggio guidato che indica il file da correggere
- [ ] Se `POSTHOG_HOST` è mancante o vuota (dopo `.trim()`), la build fallisce con messaggio guidato che indica il file da correggere
- [ ] Il messaggio di errore include: chiave problematica, percorso del file, istruzione per correggere
- [ ] La validazione avviene per tutti i task gulp che passano per `build()` (web, Android, iOS)
- [ ] Dopo `create()`, `instances/posthog.json` viene copiato in `instances/<instanceName>/posthog.json`
- [ ] La configurazione PostHog è unica e condivisa tra tutte le istanze (nessun fallback per istanza)

## Rischi

- **`posthog.json` è gitignored**: il file non è committato. In CI (GitHub Actions) dovrà essere creato prima del gulp tramite secrets — altrimenti la build fallirà. Questo è il comportamento corretto (esplicito), ma richiede che la pipeline CI venga aggiornata di conseguenza. **Mitigazione:** documentare il requisito nelle note e nei commenti del gulpfile.
- **Ordine di esecuzione della copia**: la copia di `posthog.json` nell'istanza deve avvenire *dopo* `create()` (che crea la cartella `instances/<instanceName>/`). Se avviene prima, il percorso di destinazione non esiste. **Mitigazione:** inserire il copy step come primo passo dentro il `.then()` di `create()`, prima di `update()`.
- **Local dev (`ng serve`)**: `core/posthog.json` non esiste, quindi `ng serve` diretto da `core/` fallirebbe al compile time. Questo problema è pre-esistente e fuori scope.

## Out of scope

- Supporto per `posthog.json` per-istanza (es. `instances/camminiditalia/posthog.json`)
- Creazione/aggiornamento di `core/posthog.json` per il supporto a `ng serve` locale
- Aggiornamento della pipeline CI per la gestione del secret `posthog.json`

## Moduli toccati

- `gulpfile.js` — nuova funzione `validatePosthogConfig()`, chiamata all'inizio di `build()`, copia del file nell'istanza dopo `create()`
