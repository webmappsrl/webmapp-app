> Ticket: oc:8458

# Accordion wm-config-detail: apertura multipla e rimozione scrollIntoView

## Cosa cambia

`map-details.component.ts` (pannello mappa che proietta `wm-home-layer`/`wm-track-properties`/`wm-poi-properties`) perde l'handler `onConfigDetailSettled()`/`_isFullyInView()` e il binding `(configDetailSettled)` su `wm-map-details` in `map.page.html`, perché wm-core smette di dispacciare quell'evento (vedi overview wm-core per il dettaglio del cambio di comportamento dell'accordion, misto con questo repo). Aggiunto un nuovo test Cypress in `config-detail-boxes.cy.ts` che verifica esplicitamente il comportamento multi-open (due item aperti restano entrambi aperti).

## Perché

Coerenza con la rimozione dell'evento `configDetailSettled` in wm-core (l'evento smette di essere dispacciato, l'handler diventerebbe dead code se lasciato) e con la richiesta di eliminare del tutto lo scroll automatico.

## Requisiti

- [ ] `map-details.component.ts`: rimuovere `onConfigDetailSettled()` e `_isFullyInView()`.
- [ ] `map.page.html`: rimuovere il binding `(configDetailSettled)="details.onConfigDetailSettled($event)"` su `wm-map-details`.
- [ ] Riscrivere `map-details.component.spec.ts`: rimuovere i test su `configDetailSettled`/`scrollIntoView` (oc:8427).
- [ ] Aggiungere un nuovo test in `config-detail-boxes.cy.ts` (scope EcTrack, coerente con gli altri test esistenti nello stesso file) che apre due item dell'accordion in sequenza e verifica che entrambi i `.wm-config-detail-content` risultino presenti contemporaneamente (nessuna chiusura automatica del primo).

## Rischi

- I due punti di rimozione (wm-core + questo repo) devono restare allineati nello stesso ciclo di merge — un disallineamento temporaneo lascerebbe `map-details.component.ts` con un binding `(configDetailSettled)` che non riceve mai più l'evento (dead code innocuo ma da non lasciare oltre questo ciclo).
- Il nuovo test Cypress aggiunge un punto di coverage sul comportamento multi-open ma non copre `showLess()`/chiusura scoped al gruppo (quella logica resta verificata solo dagli unit test Karma di wm-core) — accettato, la combinazione "molti item + Mostra meno" è un caso limite non richiesto esplicitamente in questo ciclo.

## Out of scope

- Nessuna modifica a `poi-properties.component.html`/`track-properties.component.html`/`home-layer.component.html` (submodule wm-core) — i mount point di `wm-config-detail` restano invariati, cambia solo chi consuma (o smette di consumare) l'evento.
- Nessuna modifica al comportamento di ridimensionamento del pannello mappa (già rimosso in oc:8427, non riguarda questo ciclo).

## Moduli toccati

- `core/src/app/pages/map/map-details/map-details.component.ts`
- `core/src/app/pages/map/map-details/map-details.component.spec.ts`
- `core/src/app/pages/map/map.page.html`
- `core/cypress/e2e/app_52/config-detail-boxes.cy.ts`
