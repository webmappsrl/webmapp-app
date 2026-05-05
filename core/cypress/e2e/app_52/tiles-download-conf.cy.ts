import {clearTestState, confURL, goMap, mapReadyTimeout} from 'cypress/utils/test-utils';

const SATELLITE_TILE_URL =
  'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=e2e-test-key';
const SATELLITE_TILE_REGEX = /^https:\/\/api\.maptiler\.com\/tiles\/satellite\//;
const TILE_REQUEST_REGEX = /\/\d+\/\d+\/\d+\.(png|jpg)/;

function setupBboxAndOpenDownload() {
  goMap();
  cy.get('body', {timeout: mapReadyTimeout}).should('have.attr', 'e2e-map-ready', 'true');
  cy.get('[e2e-map-tiles-download-button]').click();
  cy.wait(400); // wait for zoom animation to finish
  for (let i = 0; i < 5; i++) {
    cy.get('.ol-zoom-in').should('be.visible').click();
    cy.wait(100);
  }
  cy.get('[e2e-map-tiles-target-area-overlay]').should('exist');
  cy.get('.wm-map-tiles-download-button ion-button').should('be.visible').click();
  cy.get('wm-download').should('be.visible');
}

describe('Tiles download with confMAP.tiles[0] = satellite', () => {
  before(() => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          OPTIONS: {
            ...res.body.OPTIONS,
            showDownloadTiles: true,
          },
          MAP: {
            ...res.body.MAP,
            tiles: [{satellite: SATELLITE_TILE_URL}],
          },
        };
        res.send(newRes);
      });
    }).as('getConf');
    cy.intercept('GET', SATELLITE_TILE_REGEX, {statusCode: 200, body: 'OK'}).as('satelliteTile');
    cy.intercept('GET', TILE_REQUEST_REGEX, {statusCode: 200, body: 'OK'}).as('anyTile');

    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
      },
    });
  });

  it('should log a console error and abort the download when first tile is "satellite"', () => {
    setupBboxAndOpenDownload();

    cy.get('.webmapp-downloadpanel-button').should('be.visible').click();

    cy.get('@consoleError', {timeout: 5000}).should('have.been.calledWithMatch', /satellite/);

    cy.wait(2000); // ensure no async tile fetch happens after the error
    cy.get('@satelliteTile.all').should('have.length', 0);
    cy.get('.webmapp-downloadpanel-title').should('not.exist');
  });
});

describe('Tiles download with empty confMAP.tiles', () => {
  before(() => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          OPTIONS: {
            ...res.body.OPTIONS,
            showDownloadTiles: true,
          },
          MAP: {
            ...res.body.MAP,
            tiles: [],
          },
        };
        res.send(newRes);
      });
    }).as('getConf');
    cy.intercept('GET', TILE_REQUEST_REGEX, {statusCode: 200, body: 'OK'}).as('anyTile');

    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('consoleError');
      },
    });
  });

  it('should log a console error and abort the download when confMAP.tiles is empty', () => {
    setupBboxAndOpenDownload();

    cy.get('.webmapp-downloadpanel-button').should('be.visible').click();

    cy.get('@consoleError', {timeout: 5000}).should('have.been.calledWithMatch', /missing/);

    cy.wait(2000); // ensure no async tile fetch happens after the error
    cy.get('.webmapp-downloadpanel-title').should('not.exist');
  });
});
