import {clearTestState, confURL, goMap, mapReadyTimeout} from 'cypress/utils/test-utils';

describe('Record UGC auth not enabled [oc:7839] [https://orchestrator.maphub.it/resources/developer-stories/7839]', () => {
  before(() => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          AUTH: {
            ...res.body.AUTH,
            enable: false,
            webappEnable: false,
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
  });

  it('should not show register fab when auth is disabled', () => {
    goMap();
    cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');
    cy.get('.wm-btn-register-fab').should('not.exist');
  });
});

