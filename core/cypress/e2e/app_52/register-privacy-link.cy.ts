import {DEFAULT_PRIVACY_POLICY_URL} from '@wm-core/constants/links';
import {clearTestState, confURL, confWithAuthEnabled, goProfile} from 'cypress/utils/test-utils';

const privacyConf = {
  PRIVACY: {
    html: {
      en: '<p>This is Conf Privacy Policy</p>',
    },
  },
};

describe('Register Privacy Link [oc:5981] [https://orchestrator.maphub.it/resources/developer-stories/5981]', () => {
  beforeEach(() => {
    clearTestState();
  });

  it('should open the privacy policy modal with conf privacy not null', () => {
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          AUTH: {
            ...res.body.AUTH,
            enable: true,
            webappEnable: true,
          },
          ...privacyConf,
        };
        res.send(newRes);
      });
    }).as('getConf');
    cy.visit('/');
    cy.wait('@getConf');

    goProfile();

    cy.get('.wm-profile-logged-out-signup-button').should('be.visible').click();
    cy.get('.wm-registeruser-policylink').should('be.visible').click();

    cy.get('ion-modal > wm-inner-component-html')
      .should('be.visible')
      .within(() => {
        cy.get('p').should('be.visible').should('have.text', 'This is Conf Privacy Policy');
      });
  });

  it('should open the privacy policy in external link without conf privacy', () => {
    confWithAuthEnabled().as('getConf');
    cy.visit('/');
    cy.wait('@getConf');

    goProfile();

    cy.get('.wm-profile-logged-out-signup-button').should('be.visible').click();
    cy.window().then(win => {
      cy.spy(win, 'open').as('windowOpen');
    });
    cy.get('.wm-registeruser-policylink').should('be.visible').click();

    cy.get('@windowOpen').should('be.calledWith', DEFAULT_PRIVACY_POLICY_URL, '_blank');
  });
});
