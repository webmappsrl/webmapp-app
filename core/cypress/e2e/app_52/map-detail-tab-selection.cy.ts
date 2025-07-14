import {
  clearTestState,
  confWithAuthEnabled,
  e2eLogin,
  goHome,
  mockGetApiPois,
  mockGetApiTracks,
  openUgcBox,
} from 'cypress/utils/test-utils';

describe('Map detail tab selection [oc:5911] [https://orchestrator.maphub.it/resources/developer-stories/5911]', () => {
  const setupTest = (fixtureName: string, mockFunction: any) => {
    cy.fixture(fixtureName).then(fixture => {
      mockFunction(fixture).as(`getApi${fixtureName.includes('Tracks') ? 'Tracks' : 'Pois'}`);
    });
  };

  const loginAndSetup = (fixtureName: string, mockFunction: any) => {
    setupTest(fixtureName, mockFunction);
    e2eLogin();
    cy.wait(`@getApi${fixtureName.includes('Tracks') ? 'Tracks' : 'Pois'}`);
    cy.get('ion-alert button').click();
    goHome();
    openUgcBox();
  };

  const verifyTabSelected = (tabValue: string, shouldBeSelected: boolean = true) => {
    cy.get('wm-map-details')
      .should('be.visible')
      .within(() => {
        cy.get(`ion-segment-button[value="${tabValue}"]`)
          .should('be.exist')
          .and(shouldBeSelected ? 'have.class' : 'not.have.class', 'segment-button-checked');
      });
  };

  const clickTab = (tabValue: string) => {
    cy.get('wm-map-details')
      .should('be.visible')
      .within(() => {
        cy.get(`ion-segment-button[value="${tabValue}"]`).should('be.exist').click();
      });
  };

  beforeEach(() => {
    clearTestState();
    confWithAuthEnabled().as('getConf');
    cy.visit('/');
  });

  it('should select the pois tab when the user opens the UGC box and there are no tracks', () => {
    loginAndSetup('resIndexUgcPois', mockGetApiPois);
    verifyTabSelected('pois');
  });

  it('should select the tracks tab when the user opens the UGC box and there are tracks', () => {
    loginAndSetup('resIndexUgcTrack', mockGetApiTracks);
    verifyTabSelected('tracks');
  });

  it('should select the poi tab after selecting an ugc poi and go back', () => {
    setupTest('resIndexUgcPois', mockGetApiPois);
    setupTest('resIndexUgcTrack', mockGetApiTracks);
    e2eLogin();
    cy.wait('@getApiPois');
    cy.get('ion-alert button').click();
    goHome();
    openUgcBox();

    verifyTabSelected('tracks');
    clickTab('pois');
    cy.get('wm-poi-box').first().click();
    cy.get('.wm-close-btn').first().click();
    verifyTabSelected('pois');
  });
});
