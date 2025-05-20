import {
  clearTestState,
  confWithAuthEnabled,
  e2eLogin,
  goMap,
  mockGetApiTracks,
} from 'cypress/utils/test-utils';

const click_ugc_track = [257.5006408691406, 396.90460205078125];
const second_click_ugc_track = [189.38563537597656, 189.4163360595703];
let ugcTracks;

describe('Select ugc_track on map and open details', () => {
  before(() => {
    clearTestState();
    confWithAuthEnabled().as('getConf');
    cy.fixture('resIndexUgcTrack').then(resIndexUgcTrack => {
      ugcTracks = resIndexUgcTrack;
      mockGetApiTracks(resIndexUgcTrack).as('getApiTracks');
    });
    cy.visit('/');
  });

  it('should select ugc_track on map click', () => {
    const ugcTrack = ugcTracks.features[0];
    e2eLogin();
    cy.wait('@getApiTracks');
    cy.get('ion-alert button').click();

    goMap();
    cy.wait(1500);
    cy.get('.ol-viewport .ol-layer canvas').click(click_ugc_track[0], click_ugc_track[1]);
    cy.get('.ol-viewport .ol-layer canvas').click(click_ugc_track[0], click_ugc_track[1]);
    cy.wait(500);
    cy.get('wm-map-details ion-card-header ion-title').contains(ugcTrack.properties.name);
    cy.get('wm-map-details > ion-fab-button').should('be.visible').click();
    cy.wait(500);
    cy.get('.ol-viewport .ol-layer canvas').click(
      second_click_ugc_track[0],
      second_click_ugc_track[1],
    );
    cy.get('wm-map-details ion-card-header ion-title').contains(ugcTrack.properties.name);
  });
});
