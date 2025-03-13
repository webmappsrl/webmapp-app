import {
  clearTestState,
  confURL,
  data,
  e2eLogin,
  goHome,
  openLayer,
  openTrack,
} from 'cypress/utils/test-utils';

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
      };
      res.send(newRes);
    });
  }).as('getConf');
  cy.visit('/');
});

describe('Favourites [oc:4757] [https://orchestrator.maphub.it/resources/developer-stories/4757]', () => {
  it('Should favorites button not visible if not logged in', () => {
    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);

    cy.get('ion-fab-button:has(.icon-outline-heart)').should('not.exist');
  });

  it('Should favorites button visible if logged in', () => {
    e2eLogin();
    cy.get('ion-alert button').click();
    goHome();
    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);

    cy.get('ion-fab-button:has(.icon-outline-heart)').should('exist');
  });

  it('Should add to favorites', () => {
    cy.get('ion-fab-button:has(.icon-outline-heart)').click();
    cy.get('ion-fab-button:has(.icon-fill-heart)').should('exist');
  });

  it('Should remove from favorites', () => {
    cy.get('ion-fab-button:has(.icon-fill-heart)').click();
    cy.get('ion-fab-button:has(.icon-outline-heart)').should('exist');
  });
});
