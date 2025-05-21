import {clearTestState, confURL, data, elasticUrl, openLayer, openTrack} from "cypress/utils/test-utils";

let edges;
let ecTracks;
let lastTrackId;

describe('Test for tracks edge', () => {
  before(() => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const layer = res.body.MAP.layers.find(l => l.name === data.layers.ecTracksEdge);
        edges = layer.edges;
        console.log(edges);
      });
    }).as('getConf');
    cy.intercept('GET', `${elasticUrl}/?app=geohub_app_52`, req => {
      req.reply(res => {
        ecTracks = res.body.hits;
        console.log(ecTracks);
      });
    }).as('getEcTracks');
    cy.visit('/');
  });

  it('should show tracks edge', () => {
    cy.wait('@getConf');
    cy.wait('@getEcTracks');
    openLayer(data.layers.ecTracksEdge);
    openTrack(data.tracks.exampleFirstEdge);
    //TODO: check if track edge exists
  });

  it('should iterate through tracks until next does not exist', () => {
    const firstTrackId = ecTracks.find(track => track.name === data.tracks.exampleFirstEdge)?.id;
    iterateUntilEdgeButtonDoesNotExist(firstTrackId, 'next');
  });

  it('should iterate through tracks until prev does not exist', () => {
    iterateUntilEdgeButtonDoesNotExist(lastTrackId, 'prev');
  });
});

function iterateUntilEdgeButtonDoesNotExist(selectedTrackId, direction) {
  const buttonSelector = direction === 'next' ? '.wm-track-edges-next' : '.wm-track-edges-prev';
  const clickFunction = direction === 'next' ? clickNext : clickPrev;
  const edgeKey = direction === 'next' ? 'next' : 'prev';

  cy.get('body').then($body => {
    if ($body.find(buttonSelector).length > 0) {
      lastTrackId = edges[selectedTrackId][edgeKey][0];
      const edgeTrack = ecTracks.find(track => track.id === lastTrackId);
      clickFunction();
      cy.get('wm-map-details ion-title').should('contain', edgeTrack.name);
      iterateUntilEdgeButtonDoesNotExist(lastTrackId, direction);
    }
  });
}

function clickNext() {
  cy.get('.wm-track-edges-next ion-fab-button').click();
}

function clickPrev() {
  cy.get('.wm-track-edges-prev ion-fab-button').click();
}
