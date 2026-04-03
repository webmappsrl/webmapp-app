import {clearTestState, goMap, mapReadyTimeout} from 'cypress/utils/test-utils';

const E2E_FC_LABEL_WITH_LAYER_ID = `test e2e 52`;
const E2E_FC_LAYER_ID = 504;

// Coordinate (pixel) sulla mappa che cadono dentro il MultiPolygon del fixture overlay.geojson.
// Valori letti dal log della WmMapFeatureCollectionDirective.onClick.
const featureCollectionClick = [118.099365234375, 293.6827087402344];

describe('Map overlay → feature collection layer [wmMapFeatureCollection]', () => {
  before(() => {
    clearTestState();

    /** Restituisce il GeoJSON da fixture (MultiPolygon con `layer_id`, ecc.). */
    cy.intercept('GET', '**/taxonomy/geojson/52/test52.geojson', {
      fixture: 'overlay.geojson',
    }).as('getFeatureCollectionGeojson');

    cy.visit('/');
  });

  it('requests GeoJSON after overlay click and opens the expected layer details', () => {
    goMap();
    cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');

    cy.get('wm-map-controls').should('exist').click();
    cy.get('wm-map-button-control')
      .contains('span.wm-map-button-control-label', E2E_FC_LABEL_WITH_LAYER_ID)
      .closest('.wm-map-button-control-button')
      .click();

    cy.get('wm-map-button-control')
      .contains('span', E2E_FC_LABEL_WITH_LAYER_ID)
      .closest('wm-map-button-control')
      .find('.wm-map-button-control-icon')
      .should('have.class', 'selected');

    cy.wait('@getFeatureCollectionGeojson').then(interception => {
      expect(interception.response?.statusCode).to.eq(200);
      const fc = interception.response?.body as {
        features: Array<{properties: {layer_id?: number}}>;
      };
      expect(fc.features[0].properties.layer_id).to.eq(E2E_FC_LAYER_ID);
    });

    // Click sulla mappa sopra il MultiPolygon (area blu) per aprire il dettaglio layer.
    cy.get('.ol-viewport .ol-layer canvas').click(
      featureCollectionClick[0],
      featureCollectionClick[1],
      {force: true},
    );

    cy.get('wm-map-details', {timeout: mapReadyTimeout}).should('be.visible');
    cy.get('wm-map-details .wm-box-title').should('contain', 'Tracks test e2e');
  });
});
