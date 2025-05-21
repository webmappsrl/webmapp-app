import {clearTestState, data} from "cypress/utils/test-utils";

describe('Search bar', () => {
  beforeEach(() => {
    clearTestState();
    cy.visit('/');
  });
  it('should filter ectrack after search', () => {
    cy.get('wm-searchbar input').type(data.tracks.exampleOne);
    cy.get('wm-home wm-search-box').should('have.length', 1)
      .find('ion-card-title')
      .should('contain.text', data.tracks.exampleOne);
  });

  it('should remove filter after delete search text', () => {
    cy.get('wm-searchbar input').type(data.tracks.exampleOne);
    cy.get('wm-searchbar input').clear();
    cy.get('wm-home wm-search-box').should('not.exist');
  });
});