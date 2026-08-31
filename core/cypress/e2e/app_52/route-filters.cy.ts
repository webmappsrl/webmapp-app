import {clearTestState, confURL} from 'cypress/utils/test-utils';

// Endpoint reale usato in CI: test-e2e.yml inietta shardName 'geohub', il cui elasticApi è
// 'https://elastic-json.webmapp.it/v2/search' (wm-types/src/environment.ts) — non
// '/api/v2/elasticsearch' come nel template di wm-core/CLAUDE.md, che documenta un altro shard.
// Stesso pattern verificato in ugc-segnalazione-layer-selection.cy.ts e tracks-edge.cy.ts.
const ELASTIC_URL = '**/v2/search/**';

/**
 * Mock di conf ed elastic — nessuna dipendenza dal backend reale (vedi wm-core/CLAUDE.md).
 * `conf-route-filters.json` è una copia di `conf-camminiditalia-1.json` con `attributes`
 * aggiunto sui layer 55 ("Alta Via delle Grazie", shape roundtrip) e 7 ("Cammino Balteo",
 * shape linear) — stesso pattern reale di `ugc-segnalazione-layer-selection.cy.ts`.
 */
function setupIntercepts() {
  cy.intercept('GET', confURL, {fixture: 'conf-route-filters.json'}).as('conf');
  cy.intercept('GET', ELASTIC_URL, {fixture: 'elastic-init.json'}).as('elastic');
}

/** Setta privacy-accepted prima che Angular si avvii, per evitare il modal privacy. */
function visitWithPrivacy() {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.setItem('privacy-accepted', 'true');
    },
  });
}

function waitForApp() {
  cy.wait('@conf');
  cy.wait('@elastic');
}

// La lingua attiva nei test Cypress di questo repo è `en` (lingua del browser Cypress, non `it`
// — stesso comportamento già documentato in `config-detail-boxes.cy.ts`), quindi sia le chiavi
// i18n statiche (`wmtrans`, definite in italiano in `localization/i18n/it.ts` ma con traduzione
// inglese in `en.ts`) sia i nomi degli attributi della fixture (`name.it`/`name.en`) vengono
// risolti in inglese a runtime: 'Tipologia' -> 'Type', 'Anello' -> 'Roundtrip', 'Azzera filtri'
// -> 'Clear filters'.
const SHAPE_FILTER_LABEL = 'Type'; // wmtrans('Tipologia')
const ROUNDTRIP_OPTION_LABEL = 'Roundtrip'; // fixture: layer 55, shape.name.en
const RESET_BUTTON_LABEL = 'Clear filters'; // wmtrans('Azzera filtri')

/**
 * Apre il pannello dei 7 filtri ed espande la riga "Tipologia" (visualizzata come "Type" in
 * inglese). Il toggle vive dentro `wm-searchbar` stesso (variante camminiditalia, oc:8414 —
 * `search-bar.component.camminiditalia.ts`, non un componente separato): un solo `wm-searchbar`
 * è mai presente nella pagina, a differenza della versione precedente di questo test.
 */
function openShapeFilterRow() {
  cy.get('.wm-searchbar-camminiditalia-toggle').click();
  cy.contains('wm-home-route-filter-row', SHAPE_FILTER_LABEL).find('button').first().click();
}

/**
 * Seleziona l'opzione shape roundtrip (solo sul layer 55) nella riga Tipologia già aperta. Le
 * opzioni sono bottoni a chip (`.wm-home-route-filter-option`), non checkbox — fedeli al
 * riferimento camminiditalia.org.
 */
function checkRoundtripOption() {
  cy.contains('wm-home-route-filter-row', SHAPE_FILTER_LABEL)
    .contains('.wm-home-route-filter-option', ROUNDTRIP_OPTION_LABEL)
    .click();
}

describe('Home — filtri sui cammini (oc:8414)', () => {
  beforeEach(() => {
    clearTestState();
    setupIntercepts();
    visitWithPrivacy();
    waitForApp();
  });

  it('mostra il toggle filtri sulla search box quando almeno un layer ha attributes', () => {
    // Un solo wm-searchbar in pagina: la variante camminiditalia (fileReplacements) sostituisce
    // interamente quella di default, non la affianca.
    cy.get('wm-searchbar').should('have.length', 1);
    cy.get('.wm-searchbar-camminiditalia-toggle').should('exist');
  });

  it('filtra la lista dei cammini selezionando un valore Tipologia', () => {
    openShapeFilterRow();
    checkRoundtripOption();
    // Solo il layer 55 ("Alta Via delle Grazie") ha shape roundtrip; tutti gli altri layer
    // (senza attributes, o con shape linear come il layer 7) vengono esclusi.
    cy.get('wm-home-landing wm-layer-box').should('have.length', 1);
  });

  it('"Azzera filtri" ripristina la lista completa', () => {
    // Numero di cammini mostrati senza alcun filtro attivo, catturato dinamicamente invece di
    // hardcodare il conteggio totale dei box "layer" della fixture (fragile a future modifiche
    // del file conf-route-filters.json).
    cy.get('wm-home-landing wm-layer-box')
      .its('length')
      .then(fullCount => {
        openShapeFilterRow();
        checkRoundtripOption();
        cy.get('wm-home-landing wm-layer-box').should('have.length', 1);

        // `ion-button` (Ionic), non `<button>` nativo: il testo è contenuto proiettato nel
        // light DOM dell'host `ion-button`, non nel `<button>` di shadow DOM interno —
        // `cy.contains('button', …)` non lo troverebbe.
        cy.contains('ion-button', RESET_BUTTON_LABEL).click();
        cy.get('wm-home-landing wm-layer-box').should('have.length', fullCount);
      });
  });
});
