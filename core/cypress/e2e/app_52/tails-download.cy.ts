import {clearTestState, goMap, mapReadyTimeout} from 'cypress/utils/test-utils';

describe('Tiles download', () => {
  before(() => {
    clearTestState();
    cy.visit('/');
  });

  it('should see target area overlay', () => {
    goMap();
    cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');
    cy.get('[e2e-map-tiles-download-button]').click();
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

  it('should see bounding box delete button', () => {
    cy.get('body').click('center'); //click sulla feature del bounding box
    cy.get('.wm-map-delete-button').should('be.visible').click();
    cy.get('.alert-button-group button').eq(1).click();
    cy.get('.wm-map-delete-button').should('not.exist');
  });
});
