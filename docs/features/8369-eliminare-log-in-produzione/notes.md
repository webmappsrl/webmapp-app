> Ticket: oc:8369

# Notes — Eliminare log in produzione (repo principale)

## Deviazioni dal piano

Nessuna deviazione — tutte le modifiche seguono esattamente le tabelle di classificazione di `plan.md`, verificate riga per riga dopo l'esecuzione.

## Bug trovati

Nessuno introdotto da questo ticket. Segnalazione emersa durante il triage (non risolta, fuori scope): in `share.service.ts` la variabile `shareRet` resta dichiarata ma non più letta dopo la rimozione del `console.log` che la stampava — possibile warning ESLint `no-unused-vars` in CI, non affrontato in questo ciclo.

## Decisioni

- Regola "`console.log` dentro un `catch`" estesa in Fase: challenge da "solo `error`/`warn` restano" a "qualsiasi metodo, incluso `log`, resta intatto se dentro un percorso di gestione errore" — applicata uniformemente nei 3 repo.
- `main.ts:23` (`console.log(err)` nello stesso `catch` del `console.error` alla riga precedente) lasciato intatto per coerenza con la regola, nonostante sia ridondante.
- `main.ts` righe 17 e 20 (bootstrap log) commentate con marker `// DEBUG:`, non cancellate: hanno un'etichetta descrittiva e servono in sviluppo.

## Follow-up

- `wm-core/utils/console-override.ts` resta codice morto, non attivato in questo ciclo — il developer ha segnalato problemi passati con questo meccanismo durante l'analisi di errori in produzione. Da affrontare in un ticket futuro dedicato a un sistema di logging attivabile a piacere.
- Log nativi Capacitor/logcat (Xcode, Android Studio) non coperti da questo ticket — solo `console.*` JS/TS lato webview.
- Nessuna regola ESLint `no-console` introdotta — nessun guardrail automatico contro la reintroduzione futura di `console.log`. Rischio accettato consapevolmente in Fase: challenge.
