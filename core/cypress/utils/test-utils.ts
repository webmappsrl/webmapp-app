
export function goHome() {
  cy.get('#tab-button-home').dblclick();
}

export function openLayer(layerTitle: string) {
  cy.get('wm-layer-box').contains('div.wm-box-title', layerTitle).then(($box) => {
    cy.wrap($box).click();
  });
}

export function openPoi(poiTitle: string) {
  cy.get('wm-poi-box').contains('.wm-box-name', poiTitle).as('poiBox');
  cy.get('@poiBox').then(($poiBox) => {
    cy.wrap($poiBox).click();
  });
}

export function openTrack(trackTitle: string) {
  cy.get('wm-search-box').contains('ion-card-title', trackTitle).as('searchBox');
  cy.get('@searchBox').then(($searchBox) => {
    cy.wrap($searchBox).click();
  });
}
