import {clearTestState, confURL, goProfile} from "cypress/utils/test-utils";

describe('Change lenguage from english to italian', () => {
  before(() => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          LANGUAGES: {
            ...res.body.LANGUAGES,
            default: 'it',
            available: ['en', 'it']
          },
          AUTH: {
            ...res.body.AUTH,
            enable: true,
            webappEnable: true,
          },
        };
        res.send(newRes);
      });
    }).as('getConf');
    cy.visit('/');
  });

  it('should change the lenguage', () => {
    goProfile();
    // verifico che il testo sia in italiano dal bottone "Accedi"
    cy.get('.wm-profile-logged-out-login-button').should('be.visible').should('contain', 'Accedi');
    cy.get('.webmapp-profile-header-toolbar-button').should('be.visible').click();
    cy.get('wm-lang-selector').should('be.visible').click();
    cy.get('ion-alert .alert-radio-button').eq(0).click();
    cy.get('ion-alert .alert-button-group button').eq(1).click();
    cy.get('wm-settings ion-header ion-fab-button').should('be.visible').click();
    // cambiata la lingua,verifico che il testo "Accedi" sia diventato "Login"
    cy.get('.wm-profile-logged-out-login-button').should('be.visible').should('contain', 'Login');
  });
});