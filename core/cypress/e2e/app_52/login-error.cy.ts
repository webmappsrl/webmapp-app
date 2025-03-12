import {clearTestState, confWithAuthEnabled, e2eLogin} from 'cypress/utils/test-utils';

describe('Login error [oc:5027] [https://orchestrator.maphub.it/resources/developer-stories/5027]', () => {
  beforeEach(() => {
    clearTestState();
    confWithAuthEnabled().as('getConf');
    cy.visit('/');
  });

  it('should show login error for incorrect email', () => {
    e2eLogin('wrong@email.com', 'password');
    cy.get('ion-alert').should('contain', 'The email entered is incorrect. Please try again.');
  });

  it('should show login error for incorrect password', () => {
    e2eLogin(Cypress.env('email'), 'wrongPassword');
    cy.get('ion-alert').should('contain', 'The password entered is incorrect. Please try again.');
  });
});
