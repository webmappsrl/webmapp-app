> Ticket: oc:8369

# Eliminare log in produzione — repo principale (webmapp-app)

## Cosa cambia

Triage manuale di tutte le chiamate `console.log/warn/error/debug/info` presenti nel repo principale (9 file, ~25 occorrenze):

- I `console.log` di puro rumore/debug estemporaneo (es. pattern `'------- ~ Component ~ metodo ~ var'`, print grezzi senza contesto) vengono **cancellati**.
- I log strutturati con contesto che potrebbero servire per diagnosticare un problema futuro vengono **commentati** con marker dedicato `// DEBUG: <riga originale>`, così sono ricercabili in blocco (`grep -rn "// DEBUG:"`) e riattivabili senza dover ripetere il triage.
- **Qualsiasi `console.*` (incluso `console.log`, non solo `error`/`warn`) dentro un blocco `catch` o un percorso di gestione errore resta intatto e visibile anche in produzione** — il criterio è per *posizione* nel codice, non solo per metodo. Es. `main.ts:23` (`console.log(err)` nello stesso catch del `console.error` sopra) resta invariato.
- Un `console.log` fuori da un `catch` che è l'**unico segnale diagnostico di un'area già documentata come fragile/critica** (in un `CLAUDE.md` o legata a un bug fix recente) viene **commentato**, mai cancellato, anche se a prima vista sembrerebbe rumore isolato.
- Non è previsto nessun nuovo meccanismo di soppressione oltre a quello già esistente in `main.ts`.

Non viene toccato il meccanismo di override in `core/src/main.ts` (righe 9-15, silenzia `console.log` in prod) — resta come rete di sicurezza addizionale, indipendente dal triage.

## Perché

Il ticket oc:8369 richiede di non mostrare log in produzione per policy aziendale. L'analisi del codice ha rivelato che:
- `main.ts` già silenzia `console.log` in produzione (override esistente, non toccato in questo ciclo), ma non `console.warn`/`console.error`.
- Esiste in `wm-core` una utility completa (`console-override.ts`, gate dinamico via `window.wmDebug`) ma è **codice morto**, mai invocata: l'utente ha segnalato che ha causato problemi in analisi di errori passate e va **rivista in un ticket futuro** con un sistema di logging attivabile a piacere — non va toccata né attivata in questo ciclo.
- Di conseguenza il rumore visibile in produzione oggi proviene principalmente dai `console.warn`/`console.error` fuori da blocchi di errore reali, e dai `console.log` residui di debug lasciati nel codice.

## Requisiti

- [ ] Ogni `console.log/warn/error/debug/info` nel repo principale (escluso `core/src/main.ts` righe 9-15, il meccanismo di override) è stato classificato in una di tre categorie: cancella / commenta con `// DEBUG:` / lascia intatto
- [ ] Qualsiasi `console.*` (incluso `log`) dentro un `catch` o percorso di gestione errore resta non modificato — la regola è per posizione, non solo per metodo
- [ ] `settings.component.ts` (`clearWebViewData()`): i `console.log` restano commentati con `// DEBUG:`, non cancellati — unico feedback disponibile per un'azione distruttiva irreversibile
- [ ] Nessun file spec (`*.spec.ts`) che asserisce esplicitamente su chiamate `console.*` (`expect(console.log).toHaveBeenCalledWith(...)`) viene rotto dal triage — non risultano file spec di questo tipo nel repo principale, da riverificare comunque durante l'esecuzione
- [ ] Il build `ionic build --configuration production` continua a funzionare dopo le modifiche (nessuna regressione)

## Rischi

- **Log rimossi che in realtà servivano** — mitigato dal criterio "commenta, non cancellare" per qualsiasi log con contesto informativo strutturato; solo il rumore puro (separatori, print senza contesto) viene cancellato definitivamente
- **Incoerenza tra repo** — stesso criterio di classificazione applicato in modo indipendente su 3 repo (questo + wm-core + map-core) da developer/sessioni diverse nel tempo; mitigato documentando il criterio esplicito qui e nei rispettivi overview.md dei submodule

## Out of scope

- Attivazione o modifica di `wm-core/utils/console-override.ts` — resta codice morto, da affrontare in un ticket futuro dedicato a un sistema di logging attivabile a piacere
- Estensione dell'override di `main.ts` per silenziare anche `console.warn`/`console.error` in produzione — deciso esplicitamente di NON farlo: gli errori nei `catch` devono restare visibili anche in prod
- Modifica della regola ESLint (non esiste oggi `no-console` in nessuno dei 3 repo, non viene introdotta in questo ciclo) — nessun guardrail automatico contro la reintroduzione futura di `console.log`, rischio accettato consapevolmente
- **Log nativi Capacitor/logcat (Xcode, Android Studio)** — questo ticket copre solo `console.*` JS/TS lato webview; la policy aziendale "niente log in produzione" per i log nativi dei plugin Capacitor non è affrontabile da questo repo e resta fuori scope

## Moduli toccati

- `core/src/main.ts` (solo le chiamate `console.log` alle righe 17/20/23, non il meccanismo di override)
- `core/src/app/components/base-save.component.ts/base-save.component.ts`
- `core/src/app/components/settings/settings.component.ts`
- `core/src/app/pages/home/intro/intro.component.ts`
- `core/src/app/pages/map/download-panel/download-panel.component.ts`
- `core/src/app/pages/map/map.page.ts`
- `core/src/app/services/base/communication.service.ts`
- `core/src/app/services/share.service.ts`
- `core/src/app/services/store.service.ts`
