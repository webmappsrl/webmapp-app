import {goMap} from 'cypress/utils/test-utils';

beforeEach(() => {
  cy.clearLocalStorage();
  cy.visit('/');
});

describe('Orientation and location buttons', () => {
  it('Should visualize the orientation and location buttons', () => {
    goMap();
    cy.get('ion-fab-button:has(ion-icon[name="locate-outline"])').click();

    cy.get('wm-btn-orientation').should('exist');
    cy.get('ion-fab-button:has(ion-icon[name="navigate-outline"])').should('exist');
  });
});

//locate-outline
