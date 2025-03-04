import {clearTestState, confWithAuthEnabled, e2eLogin, goHome} from 'cypress/utils/test-utils';
const fileToImport = 'trackToImport.geojson';

describe('Import UGC', () => {
  before(() => {
    clearTestState();
    confWithAuthEnabled().as('getConf');
    cy.visit('/');
  });

  it('Should open import UGC [oc:4778,4779] [https://orchestrator.maphub.it/resources/developer-stories/4778,https://orchestrator.maphub.it/resources/developer-stories/4779]', () => {
    e2eLogin();
    cy.get('ion-alert button').click();
    goHome();
    cy.get('wm-ugc-box').click();
    cy.get('wm-home-ugc wm-ugc-box ion-button').click();

    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fileToImport}`, {force: true});
  });

  it('Should visualize preview map', () => {
    cy.get('ion-content ion-item ion-label').contains('p', fileToImport);
    cy.get('ion-content wm-map').should('exist');
  });

  it('Should pre-populate the form', () => {
    cy.get('ion-item.wm-form-field')
      .contains('Track title')
      .parent()
      .find('ion-input input')
      .invoke('val')
      .should('not.be.empty');

    cy.get('ion-item.wm-form-field')
      .contains('Description')
      .parent()
      .find('ion-textarea textarea')
      .invoke('val')
      .should('not.be.empty');
  });
});
