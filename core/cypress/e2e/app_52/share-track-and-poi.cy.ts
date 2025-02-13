import {goHome, openLayer, openPoi, openTrack} from "cypress/utils/test-utils";

const layerTracksTitle = 'Tracce per tests e2e';
const layerPoiTitle = 'Poi per test e2e';
const trackTitle = 'Traccia non accessibile';
const poiTitle = 'Poi semplice';

describe('Share track and poi', () => {
  before(() => {
    cy.visit('/');
  });

  it('Should correctly display share button when select track', () => {
    openLayer(layerTracksTitle);
    openTrack(trackTitle);

    getShareButton().should('exist');
  });

  it('Should open share window when click on share button', () => {
    getShareButton().as('shareBtn');
    cy.get('@shareBtn').click();
  });

  it('Should correctly display share button when select poi', () => {
    goHome();
    openLayer(layerPoiTitle);
    openPoi(poiTitle);

    getShareButton().should('exist');
  });

  it('Should open share window when click on share button', () => {
    getShareButton().as('shareBtn');
    cy.get('@shareBtn').click();
  });

});

function getShareButton() {
  return cy.get('ion-fab-button:has(ion-icon[name="share-social-outline"])');
}
