import {clearTestState, confWithAuthEnabled, e2eLogin, goMap} from "cypress/utils/test-utils";

describe('Map controls routes [oc:5468] [https://orchestrator.maphub.it/resources/developer-stories/5468]', () => {
  before(() => {
    clearTestState();
    confWithAuthEnabled().as('getConf');
    cy.visit('/');
  });

  it('should show the path control when the user is not logged in', () => {
    cy.wait('@getConf');
    goMap();
    checkRoutesMapControl();
  });

  it('should show the path control when the user is logged in', () => {
    e2eLogin();
    cy.get('ion-alert button').click();
    goMap();
    checkRoutesMapControl();
  });
});

function checkRoutesMapControl() {
  cy.get('wm-map-controls').should('exist').click();
  cy.get('wm-map-button-control').contains('span', 'Routes').should('exist');
  cy.get('wm-map-controls').should('exist').click();
}
