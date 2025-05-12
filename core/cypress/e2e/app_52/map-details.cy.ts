import {clearTestState, goMap} from "cypress/utils/test-utils";

const waitTime = 800;
const zoom_coordinates = [8.229458808898698, 280.25369262695403];
const track_coordinates = [208.15484619140534, 412.5570373535229];
const empty_click_coordinates = [141.97242736816406, 294.8253173828707];
const second_track_coordinates = [191.19117736816406, 678.142517089902]; //[185.1913604736319, 440.9936828613281]

describe('Open and close Map Details [oc:5500] [https://orchestrator.maphub.it/resources/developer-stories/5500]', () => {
  before(() => {
    clearTestState();
    cy.visit('/');
  });

  it('should open Map Details on click track in map', () => {
    goMap();
    cy.wait(1500);
    cy.get('.ol-viewport .ol-layer canvas').click(zoom_coordinates[0], zoom_coordinates[1]);
    cy.wait(waitTime);
    cy.get('.ol-viewport .ol-layer canvas').click(track_coordinates[0], track_coordinates[1]);
    cy.wait(waitTime);
    checkTrackDetailsOpened(true);
  });

  it('should closed Map Details on empty click in map', () => {
    cy.get('.ol-viewport .ol-layer canvas').click(empty_click_coordinates[0], empty_click_coordinates[1]);
    cy.wait(waitTime);
    checkTrackDetailsOpened(false);
  });

  it('should open Map Details on click second track in map', () => {
    cy.get('.ol-viewport .ol-layer canvas').click(second_track_coordinates[0], second_track_coordinates[1]);
    checkTrackDetailsOpened(true);
  });
});

function checkTrackDetailsOpened(checkIsOpened: boolean) {
  cy.get('wm-track-properties')
    .should('exist')
    .should($el => {
      if (checkIsOpened) {
        expect($el.children().length).to.be.greaterThan(0);
      } else {
        expect($el.children().length).to.be.equal(0);
      }
    });
}
