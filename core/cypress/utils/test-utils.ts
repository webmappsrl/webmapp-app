
/**
 * Navigates to the home page.
 * @param doubleClick if true, performs a double click; otherwise, performs a single click. Default is true.
 */
export function goHome(doubleClick = true) {
  if (doubleClick) {
    cy.get('#tab-button-home').dblclick();
  } else {
    cy.get('#tab-button-home').click();
  }
}

/**
 * Navigates to the map page.
 */
export function goMap() {
  cy.get('#tab-button-map').click();
}

/**
 * Opens a layer by its title.
 * @param layerTitle the title of the layer to open.
 */
export function openLayer(layerTitle: string) {
  cy.get('wm-layer-box').contains('div.wm-box-title', layerTitle).then(($box) => {
    cy.wrap($box).click();
  });
}

/**
 * Opens a POI in a layer by its title.
 * @param poiTitle the title of the POI to open.
 */
export function openPoi(poiTitle: string) {
  cy.get('wm-poi-box').contains('.wm-box-name', poiTitle).as('poiBox');
  cy.get('@poiBox').then(($poiBox) => {
    cy.wrap($poiBox).click();
  });
}

/**
 * Opens a track in a layer by its title.
 * @param trackTitle the title of the track to open.
 */
export function openTrack(trackTitle: string) {
  cy.get('wm-search-box').contains('ion-card-title', trackTitle).as('searchBox');
  cy.get('@searchBox').then(($searchBox) => {
    cy.wrap($searchBox).click();
  });
}
