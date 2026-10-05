> Ticket: oc:8701

# Passaporto: stato delle tappe nelle box della home e del layer

L'overview completa, con requisiti e rischi, sta nel submodule `wm-core`, dove vive il codice:
`docs/features/8701-passaporto-stato-delle-tappe-nelle-box-della-home-e-del-layer/overview.md`.

## Cosa cambia in questo repo

Nella configuration `camminiditalia` di `core/angular.json` si aggiungono due `fileReplacements`, che
attivano le varianti camminiditalia delle card di `wm-core`:

- `box/layer-box/layer-box.component.ts` → `layer-box.component.camminiditalia.ts` (anello di
  progresso del passaporto sulle card dei cammini)
- `box/search-box/search-box.component.ts` → `search-box.component.camminiditalia.ts` (chip
  «percorsa il …» / «non ancora percorsa» sulle card delle tappe)

Più l'aggiornamento dei puntatori ai submodule `wm-core` e `wm-types`.

## Moduli toccati

- `core/angular.json`
- submodule `wm-core`, `wm-types`
