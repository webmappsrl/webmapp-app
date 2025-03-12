import {data, goHome, openLayer, openTrack} from 'cypress/utils/test-utils';

describe('Track releted poi [oc:4735] [https://orchestrator.maphub.it/resources/developer-stories/4735]', () => {
  before(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('Should visualize the related poi in the track detail', () => {
    goHome();
    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleTwo);

    cy.get('wm-map-details').contains('ion-title', data.tracks.exampleTwo).should('exist');
    cy.get('wm-track-related-poi').should('exist');
  });

  it('Should open the related poi detail', () => {
    cy.get('wm-track-related-poi').click();

    cy.get('wm-map-details').within(() => {
      cy.get('.webmapp-pagepoi-info-header-title')
        .contains(data.tracks.exampleTwoRelatedPoi)
        .should('exist');

      cy.get('ion-title').contains(data.tracks.exampleTwo).should('exist');
    });
  });

  it('Should viusalize only track detail when click on close button', () => {
    cy.get('wm-map-details').within(() => {
      cy.get('ion-fab-button.wm-close-btn').click();
      cy.get('ion-title').contains(data.tracks.exampleTwo).should('exist');
      cy.get('.webmapp-pagepoi-info-header-title').should('not.exist');
    });
  });
});
