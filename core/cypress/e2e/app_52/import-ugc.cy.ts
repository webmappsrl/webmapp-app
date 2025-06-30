import {
  clearTestState,
  confWithAuthEnabled,
  e2eLogin,
  goHome,
  originUrl,
} from 'cypress/utils/test-utils';
const fileTrackToImport = 'trackToImport.geojson';
const filePoiToImport = 'poiToImport.geojson';

let ugcTrackProperties;
let ugcPoiProperties;

describe('Import UGC', () => {
  before(() => {
    clearTestState();
    confWithAuthEnabled().as('getConf');
    cy.fixture(fileTrackToImport).then(track => {
      ugcTrackProperties = JSON.parse(track)?.properties;
    });
    cy.fixture(filePoiToImport).then(poi => {
      ugcPoiProperties = JSON.parse(poi)?.properties;
    });
    cy.visit('/');
  });

  it('Should open import UGC [oc:4778,4779] [https://orchestrator.maphub.it/resources/developer-stories/4778,https://orchestrator.maphub.it/resources/developer-stories/4779]', () => {
    e2eLogin();
    cy.get('ion-alert button').click();
    goHome();
    cy.get('wm-ugc-box').click();
    cy.get('wm-map-details wm-home-ugc wm-ugc-box ion-button').click();
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fileTrackToImport}`, {force: true});
  });

  it('Should visualize preview map with track', () => {
    cy.get('ion-content ion-item ion-label').contains('p', fileTrackToImport);
    cy.get('ion-content wm-map').should('exist');
  });

  it('Should pre-populate the form', () => {
    cy.get('ion-item.wm-form-field')
      .contains('Track title')
      .parent()
      .find('ion-input input')
      .should('have.value', ugcTrackProperties.form.title)
      .invoke('val')
      .should('not.be.empty');

    cy.get('ion-item.wm-form-field')
      .contains('Description')
      .parent()
      .find('ion-textarea textarea')
      .should('have.value', ugcTrackProperties.form.description)
      .invoke('val')
      .should('not.be.empty');
  });

  it('Should send correct ugc track data', () => {
    mockSaveApiUgcOk('track', ugcTrackProperties).as('saveApiUgcOk');
    cy.get('ion-button[e2e-upload-button]').click();
    cy.wait('@saveApiUgcOk');
    cy.get('ion-alert .alert-button-group button').eq(0).click();
  });

  it('Should visualize preview map with poi', () => {
    cy.get('wm-map-details wm-ugc-box').click();
    cy.get('wm-map-details wm-home-ugc wm-ugc-box ion-button').click();
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${filePoiToImport}`, {force: true});
    cy.get('ion-content ion-item ion-label').contains('p', filePoiToImport);
    cy.get('ion-content wm-map').should('exist');
  });

  it('Should pre-populate the form', () => {
    cy.get('ion-item.wm-form-field')
      .contains('Title')
      .parent()
      .find('ion-input input')
      .should('have.value', ugcPoiProperties.form.title)
      .invoke('val')
      .should('not.be.empty');
  });

  it('Should send correct ugc poi data', () => {
    mockSaveApiUgcOk('poi', ugcPoiProperties).as('saveApiUgcOk');
    cy.get('ion-button[e2e-upload-button]').click();
    cy.wait('@saveApiUgcOk');
  });
});

function mockSaveApiUgcOk(ugcType: string, ugcProperties: any): Cypress.Chainable {
  return cy.intercept('POST', `${originUrl}/api/v2/ugc/${ugcType}/store`, req => {
    const bodyString = Array.isArray(req.body) ? req.body.join('') : req.body;
    expect(bodyString).to.include(ugcProperties.name);
    req.reply({
      statusCode: 200,
      body: {success: true},
    });
  });
}
