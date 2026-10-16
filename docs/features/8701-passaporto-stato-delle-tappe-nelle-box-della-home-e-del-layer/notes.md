> Ticket: oc:8701

# Notes — Passaporto: stato delle tappe nelle box della home e del layer

## Decisioni

- Tag Orchestrator associato in fase di pianificazione: `webmapp-app` (id 612). La proposta dei
  tag sul contenuto è stata saltata su richiesta del dev, che li associa dopo le PR.
- La webapp è stata tolta dal ticket dopo l'approvazione del piano: il passaporto vive solo nel
  branch `Passaporto` di `wm-core`, mentre `wm-webapp` monta `develop`, dove `passport/` non
  esiste. Aggiungere i `fileReplacements` alla webapp ne avrebbe rotto la build camminiditalia.

## Follow-up

- Quando `Passaporto` di `wm-core` arriva in `develop`: aggiungere a `wm-webapp/angular.json`
  (configuration `camminiditalia`) i due `fileReplacements` di `layer-box` e `search-box`, e
  verificare che la variante `home-layer` della webapp sia quella con badge e anello.
