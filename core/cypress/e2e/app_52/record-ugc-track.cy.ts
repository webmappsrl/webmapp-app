import {clearTestState, confURL, e2eLogin, goMap, originUrl} from 'cypress/utils/test-utils';
import 'cypress-real-events';

const positions = [
  {latitude: 42.990973, longitude: 13.868811},
  {latitude: 42.990668, longitude: 13.86879},
  {latitude: 42.990487, longitude: 13.86862},
];
let startMoving = false;
let startMovingInterval;

describe('Record track in map page [oc:5239] [https://orchestrator.maphub.it/resources/developer-stories/5239]', () => {
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
      let index = 0;

      const watchPositionStub = cy
        .stub(win.navigator.geolocation, 'watchPosition')
        .callsFake(success => {
          if (index < positions.length && startMoving) {
            success({
              coords: {
                latitude: positions[index].latitude,
                longitude: positions[index].longitude,
                accuracy: 100,
              },
            });
            index++;
          }
        });

      cy.wrap(watchPositionStub).as('watchPositionStub');

      startMovingInterval = setInterval(() => {
        if (index < positions.length && startMoving) {
          watchPositionStub.getCall(0).args[0]({
            coords: {
              latitude: positions[index].latitude,
              longitude: positions[index].longitude,
              accuracy: 50,
            },
          });
          index++;
        }
      }, 100);
    });
  });

  it('should record a track', () => {
    e2eLogin();
    cy.get('ion-alert button').click();
    goMap();

    cy.get('@watchPositionStub').should('have.been.called');

    cy.get('ion-tab-bar').should('be.visible');

    cy.get('.wm-btn-register-fab').should('be.visible').click();
    cy.get('[e2e-track-recording-btn]').should('be.visible').click();

    // Simula lo swipe
    cy.get('.webmapp-map-btnrec-fab')
      .should('be.visible')
      .realSwipe('toRight', {length: 200})
      .then(() => {
        startMoving = true;
      });

    cy.get('ion-tab-bar').should('not.be.visible');
    cy.get('.wm-btn-register-fab').should('not.be.visible');

    cy.wait(500);

    cy.get('[e2e-recorder-stop-btn]').should('exist').click();

    mockSaveApiTrack().as('saveApiUgcTrackOk');
    cy.wait(1000);
    cy.get('.webmapp-register-modalsave-savebtn')
      .should('be.visible')
      .should('not.be.disabled')
      .click();
    cy.get('.webmapp-modalsuccess-footer').should('be.visible').click();
    cy.wait('@saveApiUgcTrackOk', {timeout: 10000});
  });
});

function mockSaveApiTrack(): Cypress.Chainable {
  return cy.intercept('POST', `${originUrl}/api/v2/ugc/track/store`, req => {
    const bodyString = Array.isArray(req.body) ? req.body.join('') : req.body;
    req.reply({
      statusCode: 200,
      body: {success: true},
    });
    positions.forEach(pos => {
      const expectedString = `[${pos.longitude},${pos.latitude},0]`;
      expect(bodyString).to.include(expectedString);
    });
  });
}
