import {goMap, mapReadyTimeout} from 'cypress/utils/test-utils';

const CONF_URL = '**/config.json';
const ELASTIC_URL = '**/api/v2/elasticsearch*';

const fakeUser = {
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  access_token: 'cypress-test-token',
  properties: {
    privacy: [{agree: true, date: '2024-01-01T00:00:00Z'}],
  },
};

const layerInput = '[e2e-form-input="layer"] input';

/**
 * Mock di tutte le API esterne necessarie — nessuna dipendenza dal backend reale.
 * Fixture catturate una tantum (vedi wm-core/CLAUDE.md).
 */
function setupIntercepts() {
  cy.intercept('GET', CONF_URL, {fixture: 'conf-camminiditalia-1.json'}).as('conf');
  cy.intercept('GET', ELASTIC_URL, {fixture: 'elastic-init.json'}).as('elastic');

  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: fakeUser,
  }).as('loginRequest');

  cy.intercept('GET', '**/api/auth/me', {
    statusCode: 200,
    body: fakeUser,
  }).as('meRequest');
}

function visitWithPrivacy() {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.clear();
      win.localStorage.setItem('privacy-accepted', 'true');
    },
  });
}

function waitForApp() {
  cy.wait('@conf');
  cy.wait('@elastic');
}

function dismissOverlays() {
  cy.get('body').then($body => {
    if ($body.find('ion-alert').length) {
      const buttons = $body.find('ion-alert .alert-button-group button');
      const idx = buttons.length > 1 ? 1 : 0;
      cy.get('ion-alert .alert-button-group button').eq(idx).click({force: true});
      cy.get('ion-alert').should('not.exist');
    }
  });
  cy.get('body').then($body => {
    if ($body.find('ion-modal .dismiss').length) {
      cy.get('ion-modal .dismiss').click({force: true});
    }
  });
}

function loginAndGoMap() {
  cy.get('#tab-button-profile').click();
  cy.get('.wm-profile-logged-out-login-button').click();
  cy.get('ion-input[formcontrolname="email"] input').should('exist').clear().type('test@test.com');
  cy.get('ion-input[formcontrolname="password"] input').clear().type('password');
  cy.get('.wm-login-submit-button').click();
  cy.wait('@loginRequest');
  dismissOverlays();
  cy.get('#tab-button-map').click({force: true});
  cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');
  dismissOverlays();
}

function openSegnalazioneForm() {
  cy.get('.wm-btn-register-fab').should('be.visible').click();
  cy.get('[e2e-waypoint-btn]').should('be.visible').click();
  cy.get('wm-poi-recorder ion-card ion-button').should('be.visible').click();
  cy.get('ion-modal webmapp-modal-save', {timeout: 10000}).should('be.visible');
  cy.get('wm-select-nearby-layer', {timeout: 10000}).should('exist');
}

describe('UGC Segnalazione: selezione layer [oc:7639]', () => {
  before(() => {
    setupIntercepts();
    visitWithPrivacy();
    waitForApp();
    cy.window().then(win => {
      cy.stub(win.navigator.geolocation, 'watchPosition').callsFake(success => {
        success({coords: {latitude: 37.5, longitude: 15}});
      });
    });
    goMap();
    cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');
    loginAndGoMap();
  });

  beforeEach(() => {
    dismissOverlays();
    cy.get('body').then($body => {
      if ($body.find('ion-modal webmapp-modal-save').length === 0) {
        openSegnalazioneForm();
      }
    });
  });

  it('il campo layer è visibile nel form segnalazione', () => {
    cy.get('wm-select-nearby-layer').should('exist');
    cy.get('[e2e-form-input="layer"]').should('exist');
  });

  it('il campo layer mostra le opzioni quando si digita', () => {
    cy.get('[e2e-form-input="layer"]').click();
    cy.get(layerInput).type('a', {force: true});
    cy.get('#wm-layer-listbox').should('be.visible');
  });

  it('clearSelection azzera il valore dell\'input', () => {
    cy.get(layerInput).clear({force: true}).type('test', {force: true});
    cy.get(layerInput).clear({force: true});
    cy.get(layerInput).should('have.value', '');
  });

  it('si può salvare la segnalazione senza selezionare un layer', () => {
    cy.get(layerInput).clear({force: true});
    cy.get('[e2e-form-input="title"] input').clear({force: true}).type('Test segnalazione senza layer');

    cy.get('.webmapp-register-modalsave-savebtn')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.get('.webmapp-modalsuccess-footer', {timeout: 10000}).should('be.visible');
  });
});
