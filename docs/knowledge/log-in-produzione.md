# Log in produzione

## Come funziona oggi

Il criterio di triage dei `console.*` ha **due assi, posizione e metodo**, non il solo nome del metodo:

- qualunque `console.*` — incluso `console.log` — **dentro un `catch` o un percorso di gestione errore resta intatto**;
- fuori da un catch, `console.error` e `console.warn` restano sempre visibili, anche in produzione;
- i `console.log` senza contesto — dump di variabili, separatori, trace da IDE tipo `'------- ~ Component ~ metodo ~ var'` — vengono cancellati;
- quelli con valore diagnostico vengono commentati con il marker `// DEBUG:`, ricercabile con `grep -rn "// DEBUG:"`.

`core/src/main.ts` ha un override preesistente che silenzia `console.log` in produzione: **non è stato toccato**, resta come rete di sicurezza indipendente dal triage manuale.

## Perché così

- **`wm-core/utils/console-override.ts` è codice morto deliberato** (oc:8369): darebbe un gate runtime completo via `window.wmDebug`, ma il developer ha segnalato problemi passati con quel meccanismo durante l'analisi di errori in produzione. Da rivedere in un ticket dedicato con un sistema di logging attivabile, non qui.
- **Nessuna regola ESLint `no-console`** (oc:8369): non c'è alcun guardrail automatico contro la reintroduzione di `console.log`. Rischio accettato consapevolmente.

## Debito noto

- **`shareRet` in `share.service.ts`** resta dichiarata e non più letta dopo la rimozione del log che la stampava (oc:8369): possibile warning `no-unused-vars`, non affrontato.
