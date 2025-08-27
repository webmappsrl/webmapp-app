import {clearTestState, goMap, mapReadyTimeout} from 'cypress/utils/test-utils';

describe('Tiles download by bounding box', () => {
  before(() => {
    clearTestState();
    cy.visit('/');
  });

  it('should see target area overlay', () => {
    goMap();
    cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');
    cy.get('[e2e-map-tiles-download-button]').click();
    cy.wait(400); // wait for zoom animation to finish
    for (let i = 0; i < 5; i++) {
      cy.get('.ol-zoom-in').should('be.visible').click();
      cy.wait(100); // wait for zoom animation to finish
    }
    cy.get('[e2e-map-tiles-target-area-overlay]').should('exist');
  });

  it('should download tiles', () => {
    cy.get('.wm-map-tiles-download-button ion-button').should('be.visible').click();
    cy.get('wm-download').should('be.visible');

    cy.get('.webmapp-downloadpanel-button').should('be.visible').click();
    cy.get('.webmapp-downloadpanel-title', {timeout: 30000})
      .should('be.visible')
      .should('have.text', 'Download completed');

    cy.get('.webmapp-downloadpanel-button').should('be.visible').click();
  });

  it('should see bounding box delete button and delete it', () => {
    cy.get('body').click('center'); //click sulla feature del bounding box
    cy.get('.wm-map-delete-bounding-box-button').should('be.visible').click();
    cy.get('.alert-button-group button').eq(1).click();
    cy.get('.wm-map-delete-bounding-box-button').should('not.exist');
  });
});
