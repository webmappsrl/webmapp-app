import {
  clearTestState,
  confWithAuthEnabled,
  e2eLogin,
  goHome,
  mockGetApiTracks,
  mockSaveApiTracksOffline,
} from 'cypress/utils/test-utils';

const trackToImport = 'trackToImport.geojson';
let titleSynchronizedTrack;
let titleNotSynchronizedTrack;

describe('Visualize sync badge [oc:4776] [https://orchestrator.maphub.it/resources/developer-stories/4776]', () => {
  before(() => {
    clearTestState();
    confWithAuthEnabled().as('getConf');
    cy.fixture('trackToImport.geojson').then(track => {
      try {
        titleNotSynchronizedTrack = JSON.parse(track)?.properties?.name;
      } catch (error) {
        cy.log('Error parsing track', error);
      }
    });
    cy.visit('/');
  });

  beforeEach(() => {
    cy.fixture('resIndexUgcTrack').then(mockRes => {
      titleSynchronizedTrack = mockRes?.features[0]?.properties?.name;
      mockGetApiTracks(mockRes).as('getApiTracks');
    });
    mockSaveApiTracksOffline().as('saveApiTracksOffline');
  });

  it('should ugc track box synchronized correct icon', () => {
    e2eLogin();
    cy.wait('@getApiTracks');
    cy.get('ion-alert button').click();

    goHome();
    cy.get('wm-ugc-box').click();

    checkSynchronizedBadge(titleSynchronizedTrack, true);
  });

  it('should ugc track box not synchronized correct icon', () => {
    cy.get('wm-home-ugc wm-ugc-box ion-button').click();
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${trackToImport}`, {force: true});
    cy.get('ion-toolbar ion-buttons[slot="end"] ion-button').contains('Carica').click();
    cy.get('@saveApiTracksOffline.all').then(calls => {
      cy.log(`API chiamata ${calls.length} volte`);
    });
    cy.get('ion-alert button').click();

    checkSynchronizedBadge(titleNotSynchronizedTrack, false);
    clearTestState();
  });
});

function checkSynchronizedBadge(title: string, beSynchronized: boolean) {
  const iconName = beSynchronized ? 'cloud-done-outline' : 'cloud-offline-outline';
  cy.get('wm-search-box')
    .contains('ion-card-title', title)
    .parents('wm-search-box')
    .within(() => {
      cy.get(`wm-ugc-synchronized-badge ion-icon[name="${iconName}"]`).should('exist');
    });
}
