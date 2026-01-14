/*
  This test is performed on app 52, it verifies the home-result component functionality:
    - Verifies that the home-result component is displayed when opening a layer
    - Verifies that the tracks segment button is selected when opening the ecTrack layer
    - Verifies that the pois segment button is selected when opening the ecPoi layer
*/

import {clearTestState, data, openLayer} from 'cypress/utils/test-utils';

describe('Home result component [oc:6780] ]', () => {
  beforeEach(() => {
    clearTestState();
    cy.visit('/');
  });

  it('should load home page and display home-result component', () => {
    openLayer(data.layers.ecTrack);
    cy.get('wm-home-result').should('exist');
  });

  it('should have tracks segment button selected when opening ecTrack layer (layer shows both tracks and pois)', () => {
    openLayer(data.layers.ecTrack);
    cy.get('[e2e-home-result-tracks-tab]')
      .should('exist')
      .and('have.class', 'segment-button-checked');
  });

  it('should have tracks segment button selected when opening ecTracksEdge layer (layer shows only tracks)', () => {
    openLayer(data.layers.ecTracksEdge);
    cy.get('[e2e-home-result-tracks-tab]')
      .should('exist')
      .and('have.class', 'segment-button-checked');
  });

  it('should have pois segment button selected when opening ecPoi layer (layer shows only pois)', () => {
    openLayer(data.layers.ecPoi);
    cy.get('[e2e-home-result-pois-tab]')
      .should('exist')
      .and('have.class', 'segment-button-checked');
  });
});
