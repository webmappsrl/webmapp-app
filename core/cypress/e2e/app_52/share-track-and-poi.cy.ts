import {goHome, openLayer, openPoi, openTrack, data} from 'cypress/utils/test-utils';

describe('Share track and poi [oc:4740] [https://orchestrator.maphub.it/resources/developer-stories/4740]', () => {
  before(() => {
    cy.visit('/');
  });

  it('Should correctly display share button when select track', () => {
    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);

    getShareButton().should('exist');
  });

  it('Should open share window when click on share button', () => {
    getShareButton().as('shareBtn');
    cy.get('@shareBtn').click();
  });

  it('Should correctly display share button when select poi', () => {
    goHome();
    openLayer(data.layers.ecPoi);
    openPoi(data.pois.exampleOne);

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
