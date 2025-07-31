import {
  clearTestState,
  confURL,
  e2eLogin,
  goMap,
  mapReadyTimeout,
  originUrl,
} from 'cypress/utils/test-utils';
import 'cypress-real-events';

const coordinates = [42.990973, 13.868811];

describe('Record UGC POI [oc:6003] [https://orchestrator.maphub.it/resources/developer-stories/6003]', () => {
  before(() => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          AUTH: {
            ...res.body.AUTH,
            enable: true,
            webappEnable: true,
          },
          MAP: {
            ...res.body.MAP,
            record_track_show: true,
          },
        };
        res.send(newRes);
      });
    }).as('getConf');
    cy.visit('/');

    cy.window().then(win => {
      cy.stub(win.navigator.geolocation, 'watchPosition').callsFake(success => {
        success({
          coords: {
            latitude: coordinates[0],
            longitude: coordinates[1],
          },
        });
      });
    });
  });

  it('should hide tab bar and register button when recording starts', () => {
    e2eLogin();
    cy.get('ion-alert button').click();
    goMap();
    cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');

    cy.get('.wm-btn-register-fab').should('be.visible').click();
    cy.get('[e2e-waypoint-btn]').should('be.visible').click();

    cy.get('ion-tab-bar').should('not.be.visible');
    cy.get('.wm-btn-register-fab').should('not.be.visible');

    cy.get('wm-poi-recorder ion-card')
      .should('be.visible')
      .within(() => {
        cy.get('div').should($div => {
          const text = $div.text();
          const truncatedLat = Math.floor(coordinates[0] * 1000) / 1000;
          const truncatedLng = Math.floor(coordinates[1] * 1000) / 1000;
          expect(text).to.include(truncatedLat);
          expect(text).to.include(truncatedLng);
        });
      });
  });

  it('should close the POI recorder and show tab bar and register button', () => {
    cy.get('wm-poi-recorder ion-fab-button').should('exist').click();
    cy.get('ion-tab-bar').should('be.visible');
    cy.get('.wm-btn-register-fab').should('be.visible');
  });

  it('should successfully record a POI and display success modal', () => {
    cy.get('.wm-btn-register-fab').should('be.visible').click();
    cy.get('[e2e-waypoint-btn]').should('be.visible').click();
    cy.get('wm-poi-recorder ion-card ion-button').should('be.visible').click();

    cy.get('ion-modal webmapp-modal-save').should('be.visible');
    cy.get('ion-modal webmapp-modal-save ion-header ion-title').should(
      'have.text',
      'Save Waypoint',
    );

    mockSaveApiPoi().as('saveApiUgcPoiOk');
    cy.wait(1000);
    cy.get('.webmapp-register-modalsave-savebtn')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.get('.webmapp-modalsuccess-footer').should('be.visible').click();
    cy.wait('@saveApiUgcPoiOk', {timeout: 10000});
  });

  it('should successfully record a POI during track recording', () => {
    cy.visit('/');
    cy.window().then(win => {
      cy.stub(win.navigator.geolocation, 'watchPosition').callsFake(success => {
        success({
          coords: {
            latitude: coordinates[0],
            longitude: coordinates[1],
          },
        });
      });
    });
    goMap();
    cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');

    cy.get('.wm-btn-register-fab').should('be.visible').click();
    cy.get('[e2e-track-recording-btn]').should('be.visible').click();

    cy.get('.webmapp-map-btnrec-fab').should('be.visible').realSwipe('toRight', {length: 200});
    cy.get('[e2e-recorder-waypoint-btn]').should('exist').click();
    cy.get('wm-poi-recorder ion-card ion-button').should('be.visible').click();

    cy.get('ion-modal webmapp-modal-save').should('be.visible');
    cy.get('ion-modal webmapp-modal-save ion-header ion-title').should(
      'have.text',
      'Save Waypoint',
    );

    mockSaveApiPoi().as('saveApiUgcPoiOk');
    cy.wait(1000);
    cy.get('.webmapp-register-modalsave-savebtn')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.get('.webmapp-modalsuccess-footer').should('be.visible').click();
    cy.wait('@saveApiUgcPoiOk', {timeout: 10000});
  });
});

function mockSaveApiPoi(): Cypress.Chainable {
  return cy.intercept('POST', `${originUrl}/api/v2/ugc/poi/store`, req => {
    const bodyString = Array.isArray(req.body) ? req.body.join('') : req.body;
    req.reply({
      statusCode: 200,
      body: {success: true},
    });
    const expectedString = `[${coordinates[1]},${coordinates[0]}]`;
    expect(bodyString).to.include(expectedString);
  });
}
