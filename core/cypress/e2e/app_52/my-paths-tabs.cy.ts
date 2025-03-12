import {
  confWithAuthEnabled,
  e2eLogin,
  goHome,
  mockGetApiPois,
  mockGetApiTracks,
} from 'cypress/utils/test-utils';

import {clearTestState} from 'cypress/utils/test-utils';

describe('My paths tabs', () => {
  before(() => {
    clearTestState();
    confWithAuthEnabled().as('getConf');
    cy.fixture('resIndexUgcTrack').then(mockRes => {
      mockGetApiTracks(mockRes).as('getApiTracks');
    });
    cy.fixture('resIndexUgcPois').then(mockRes => {
      mockGetApiPois(mockRes).as('getApiPois');
    });
    cy.visit('/');
  });

  it('should display the i miei dati tabs', () => {
    e2eLogin();
    cy.wait('@getApiTracks');
    cy.wait('@getApiPois');
    cy.get('ion-alert button').click();

    goHome();
    cy.get('wm-ugc-box').click();

    cy.get('ion-segment-button[value="tracks"]').should('exist');
    cy.get('ion-segment-button[value="pois"]').should('exist');
  });
});
