> Ticket: oc:8105

# Notes — Gulp: validazione posthog.json prima della build

## Deviazioni dal piano

- `process.exit(1)` sostituito con `throw new Error()` su indicazione della code review (wm-review-ticket): il `throw` dentro un Promise executor viene catturato automaticamente da Node e convertito in rejection pulita, permettendo il teardown di Gulp. Il piano originale usava `process.exit(1)` per semplicità.
- `fs.existsSync` rimosso: la code review ha evidenziato il pattern TOCTOU (Time-Of-Check Time-Of-Use). L'unico try/catch con `err.code === 'ENOENT'` è più corretto e più conciso.
- `fs.copyFileSync` wrappato in try/catch con `reject()`: senza il try/catch, un'eccezione nella copia avrebbe causato una unhandled Promise rejection con la Promise esterna di `build()` bloccata in pending.
- Aggiunto check `typeof val !== 'string'`: se una chiave nel JSON è un numero o null, `.trim()` avrebbe lanciato TypeError non gestito.
- Aggiunta costante `ABORTING_BANNER` per evitare la ripetizione della stringa "Aborting" 3 volte.

## Bug trovati

- Nessun bug pre-esistente trovato nell'area toccata.

## Decisioni

- La funzione `validatePosthogConfig()` è sincrona e può lanciare — questo è documentato nella funzione stessa tramite il comportamento del throw. Non è stata convertita a Promise per mantenere la semplicità e perché il Promise executor la cattura automaticamente.
- `ABORTING_BANNER` è definita come costante a livello di modulo (non dentro la funzione) per coerenza con le altre costanti del gulpfile (es. `CONSOLE_COLORS`, `APIGEOHUB`).

## Follow-up

- **CI/CD**: prima del merge, verificare che il secret `instances/posthog.json` sia configurato in GitHub Actions. Il file è gitignored e non viene creato automaticamente — senza di esso tutte le build CI falliranno con l'errore esplicito del gulp.
- **Rollback di emergenza**: se serve una build urgente durante una rotazione di credenziali PostHog, creare temporaneamente `instances/posthog.json` con i valori precedenti.
