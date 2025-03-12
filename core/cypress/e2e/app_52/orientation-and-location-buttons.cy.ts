import {goMap} from 'cypress/utils/test-utils';

describe('Orientation and location buttons [oc:4745] [https://orchestrator.maphub.it/resources/developer-stories/4745]', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('Should visualize the orientation and location buttons', () => {
    goMap();
    cy.get('ion-fab-button:has(ion-icon[name="locate-outline"])').click();

    cy.get('wm-btn-orientation').should('exist');
    cy.get('ion-fab-button:has(ion-icon[name="navigate-outline"])').should('exist');
  });
});

//locate-outline
