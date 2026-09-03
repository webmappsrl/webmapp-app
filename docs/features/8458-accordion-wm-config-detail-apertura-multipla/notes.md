> Ticket: oc:8458

# Notes — Accordion wm-config-detail: apertura multipla e rimozione scrollIntoView (webmapp-app)

## Deviazioni dal piano

- Nessuna deviazione nel codice applicativo (Task 1 eseguito come da `plan.md`).
- **Task 2 (nuovo test Cypress multi-open): scritto e poi eseguito realmente dal developer** (contrariamente a quanto inizialmente previsto in questo file — vedi sotto "Bug trovati") **contro `ionic serve` reale: passa.** L'assunzione iniziale che richiedesse di toccare `environment.ts` non si è rivelata un blocco reale nella pratica.

## Bug trovati

- **`openPoi()` (`cypress/utils/test-utils.ts:177-184`) falliva in modo intermittente** con `AssertionError: ... is not visible because its ancestor has position: fixed CSS property and it is overflowed by other elements` — bug preesistente nell'helper condiviso, scoperto eseguendo realmente il nuovo test Cypress di questo ticket (non causato dalle modifiche di questa feature: l'helper è usato per navigare verso un POI dai risultati Home, prima ancora che `wm-config-detail`/l'accordion entrino in gioco). Fix minimo: aggiunto `.scrollIntoView()` prima di `.should('be.visible')`, come suggerito dallo stesso messaggio di errore Cypress. Nessun altro chiamante di `openPoi()` nel repo dovrebbe essere impattato negativamente da uno scroll esplicito prima del click.

## Decisioni

- Eseguita l'implementazione diretta (Read/Edit) invece di `superpowers:subagent-driven-development` — stesso motivo documentato nelle notes di wm-core (conflitto tra il meccanismo di commit-per-task della skill e il vincolo "nessun commit durante l'esecuzione").

## Verifiche eseguite

- `npx ng test --watch=false --browsers=ChromeHeadless --include='**/map-details/**/*.spec.ts'` (Node 20.19.0): **20/20 PASS**.
- `grep -rn "configDetailSettled\|ConfigDetailToggleEvent\|onConfigDetailSettled" core/src/app/pages/map`: nessun residuo dopo Task 1.
- Cypress: test `'keeps multiple config_detail items open at the same time (oc:8458)'` verificato passare contro `ionic serve` reale dal developer (vedi "Deviazioni dal piano"). Test preesistente `'renders config_detail as a closed-by-default accordion on the EcPoi detail'`, inizialmente rosso per il bug in `openPoi()` (vedi "Bug trovati"), confermato verde dopo il fix.

## Follow-up

Nessuno. Test Cypress già verificato realmente (vedi sopra).
