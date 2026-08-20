> Ticket: oc:8181

# Schermata cammino con blocchi informativi configurabili — EcPoi + test E2E (webmapp-app)

## Cosa cambia

Il dettaglio EcPoi (repo principale, non wm-core — `poi-properties.component.html`) mostra lo stesso blocco di box informativi introdotto in wm-core (vedi `overview.md` di quel repo per la feature completa), wired dopo la descrizione esistente.

Viene inoltre aggiunto un test Cypress E2E dedicato che verifica il rendering dei box su Layer/EcTrack/EcPoi via fixture (pattern `cy.intercept()` già standard nel repo, vedi CLAUDE.md di wm-core).

## Perché

Stesso ticket oc:8181. Il componente EcPoi vive nel repo principale, non in wm-core (classificazione di dominio, vedi Fase: environment-setup). Il test Cypress è l'unica rete di sicurezza automatizzata disponibile per questa feature, dato che i test Karma/TestBed dei componenti wm-core sono esclusi dalla CI (bug noto `NG0201`, vedi CLAUDE.md → oc:8023).

## Requisiti

- [ ] Wiring del componente condiviso (esportato da wm-core) in `core/src/app/components/poi-properties/poi-properties.component.html`, dopo `wm-tab-description`
- [ ] Nuovo test Cypress E2E (`core/cypress/e2e/app_52/...`) con `config_detail` popolato su **tutte e tre** le risorse (Layer, EcTrack, EcPoi) — non solo una, per non lasciare 2 wiring point su 3 senza copertura automatica — che verifica: rendering della lista accordion, stato chiuso di default, apertura di un item mostra il contenuto, fallback lingua a cascata, nessun rendering quando `config_detail` non è presente
- [ ] Iniezione del dato via `mockGetPoi()`/`mockGetTrack()` (`core/cypress/utils/test-utils.ts`), **non** tramite `conf-camminiditalia-1.json` (quella è la config globale dell'app — `APP`/`HOME`/`WEBAPP`/`TRANSLATIONS` — `config_detail` vive invece dentro `properties` della singola feature GeoJSON, stesso punto di iniezione già usato per `properties.info`/`properties.excerpt` in `ec-poi-details.cy.ts`)
- [ ] Verifica manuale (non automatizzata) prima del commit: apri/chiudi un item dell'accordion nel pannello di dettaglio (`map-details.component.*`, oc:8313, mergiato il 2026-07-30) e controlla che l'altezza dinamica del pannello (`computeTargetHeight()`, `ResizeObserver`) si aggiorni senza scatti/overshoot/contenuto tagliato — nessun test Cypress dedicato esiste oggi per questa interazione

## Rischi

- Nessuna rete di sicurezza a livello di componente (test Karma esclusi dalla CI): il test Cypress E2E diventa l'unica copertura automatizzata per la logica di fallback lingua e per il comportamento lazy-render — un bug introdotto in un refactor futuro del componente wm-core potrebbe non essere colto se il test E2E non copre esplicitamente questi rami.
- **Interazione con il calcolo dinamico dell'altezza del pannello di dettaglio (oc:8313, emerso in Challenge)**: `map-details.component.ts` calcola l'altezza del pannello via `ResizeObserver` sul contenuto reale (`computeTargetHeight()`). Un accordion con contenuto lazy (`*ngIf` su expand/collapse) cambia l'altezza del contenuto dopo il render iniziale — esattamente il tipo di variazione osservata da quel meccanismo, introdotto il giorno prima di questo ciclo e senza test automatico su questa interazione specifica. Mitigato con verifica manuale esplicita (vedi Requisiti), non con un nuovo test dedicato.

## Out of scope

- Modifiche a Layer/EcTrack — vivono in wm-core, coperte dall'overview di quel repo.
- Test Karma/TestBed del nuovo componente wm-core — coerente con l'esclusione esistente dalla CI per quei componenti (oc:8023).

## Moduli toccati

- `core/src/app/components/poi-properties/poi-properties.component.html`
- `core/cypress/e2e/app_52/<nuovo-file>.cy.ts` (naming esatto da definire in plan.md)
- `core/cypress/fixtures/<fixture nuova o estesa>.json`
