import {openLayer, openTrack, data} from 'cypress/utils/test-utils';

describe('Download ec-track', () => {
  before(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('Should visualize ec-track download button', () => {
    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);

    getDownloadButton().should('exist');
  });

  it('Should download ec-track', () => {
    getDownloadButton().click();

    cy.get('wm-download').should('exist');

    getGoToDownloadsButton().should('exist').as('downloadButton');
  });

  it('Should visualize the download track', () => {
    getGoToDownloadsButton().click();
    cy.get('wm-search-box').contains('ion-card-title', data.tracks.exampleOne).should('exist');
  });
});

function getDownloadButton() {
  return cy.get('ion-fab-button:has(ion-icon[name="download-outline"])');
}

function getGoToDownloadsButton() {
  return cy.get('wm-download ion-button.webmapp-downloadpanel-button', {timeout: 7000});
}
