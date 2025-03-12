/*
  This test is performed on app 52, it verifies that the non-accessibility message of the track
  is correctly displayed,
    - Select the layer "Tracce per tests e2e", relative to the layer with id 504
    - Select the track "Traccia non accessibile", relative to the track with id 86095
    - It is checked that the non-accessibility message is correctly displayed
*/

import {data} from 'cypress/utils/test-utils';

const notAccessibleMessage = 'This trail is not accessible';

describe('Not accessible track [oc:4699] [https://orchestrator.maphub.it/resources/developer-stories/4699]', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Should correctly display the non-accessibility message', () => {
    cy.get('wm-layer-box')
      .contains('div.wm-box-title', data.layers.ecTrack)
      .then($box => {
        cy.wrap($box).click();
      });

    cy.get('wm-search-box')
      .contains('ion-card-title', data.tracks.exampleOne)
      .then($searchBox => {
        cy.wrap($searchBox).click();
      });

    cy.get('wm-track-properties').within(() => {
      cy.get('wm-track-alert')
        .should('exist')
        .within(() => {
          cy.get('ion-label').contains(notAccessibleMessage).should('exist');
        });
    });
  });
});
