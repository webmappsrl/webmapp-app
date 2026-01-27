import {
  clearTestState,
  confWithAuthEnabled,
  e2eLogin,
  goProfile,
  meUrl,
} from 'cypress/utils/test-utils';

describe('Login offline [oc:4772] [https://orchestrator.maphub.it/resources/developer-stories/4772]', () => {
  before(() => {
    clearTestState();
  });

  beforeEach(() => {
    confWithAuthEnabled().as('getConf');
    cy.visit('/');
  });

  it('Should login online', () => {
    e2eLogin();
    cy.get('ion-alert button').click();
  });

  it('Should login offline', () => {
    cy.intercept('POST', meUrl, req => {
      req.reply(res => {
        res.send({
          statusCode: 500,
        });
      });
    }).as('meOffline');
    cy.reload();
    cy.wait('@meOffline');
    goProfile();
    cy.get('wm-profile-user').should('not.be.empty');
  });
});
