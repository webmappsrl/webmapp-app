import {clearTestState, confURL, e2eLogin, goMap} from 'cypress/utils/test-utils';

const poi_acquisition_form = [
  {
    id: 'report',
    default: false,
    label: {
      it: 'Segnalazione',
      en: 'Report',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        placeholder: {
          it: 'Inserisci un titolo',
          en: 'Add a title',
        },
        required: true,
        label: {
          it: 'Titolo',
          en: 'Title',
        },
      },
      {
        name: 'report_type',
        type: 'select',
        required: true,
        label: {
          it: 'Segnalazione',
          en: 'Report type',
        },
        helper: {
          it: 'La segnalazione sarà visibile agli amministratori',
          en: 'The report will be visible to administrators',
        },
        values: [
          {
            value: 'muddy_ground',
            label: {
              it: 'Suolo fangoso',
              en: 'Muddy ground',
            },
          },
          {
            value: 'missing_signage',
            label: {
              it: 'Segnaletica carente',
              en: 'Missing signage',
            },
          },
          {
            value: 'other',
            label: {
              it: 'Altro',
              en: 'Other',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'poi',
    label: {
      it: 'Punto di interesse',
      en: 'Point of interest',
    },
    helper: {
      it: 'Helper per i punti di interesse',
      en: 'Point of interest helper',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        placeholder: {
          it: 'Inserisci un titolo',
          en: 'Add a title',
        },
        required: true,
        label: {
          it: 'Titolo',
          en: 'Title',
        },
      },
      {
        name: 'waypointtype',
        type: 'select',
        required: true,
        label: {
          it: "Punto d'Interesse",
          en: 'Point of interest',
        },
        values: [
          {
            value: 'landscape',
            label: {
              it: 'Panorama',
              en: 'Landscape',
            },
          },
          {
            value: 'other',
            label: {
              it: 'Altro',
              en: 'Other',
            },
          },
        ],
      },
    ],
  },
];
const index_form_selected = 1;

describe('Test wm-form field', () => {
  before(() => {
    clearTestState();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          AUTH: {
            ...res.body.AUTH,
            enable: true,
            webappEnable: true,
          },
          MAP: {
            ...res.body.MAP,
            record_track_show: true,
          },
          APP: {
            ...res.body.APP,
            poi_acquisition_form,
          },
        };
        res.send(newRes);
      });
    }).as('getConf');
    cy.visit('/');

    cy.window().then(win => {
      cy.stub(win.navigator.geolocation, 'watchPosition').callsFake(success => {
        success({
          coords: {
            latitude: 42.990973,
            longitude: 13.868811,
          },
        });
      });
    });
  });

  it('should open poi acquisition form', () => {
    e2eLogin();
    cy.get('ion-alert button').click();
    goMap();

    cy.get('.wm-btn-register-fab').should('be.visible').click();
    cy.get('[e2e-waypoint-btn]').should('be.visible').click();
    cy.get('wm-poi-recorder ion-card ion-button').should('be.visible').click();
    cy.get('webmapp-modal-save').should('be.visible');
  });

  it('should select type form whene there are multiple types', () => {
    // quando ho più tipologie di form devo selezionare quale voglio ed ho inizialmente un solo elemento nella form
    cy.get('wm-form > form > ion-item').should('have.length', index_form_selected).click();
    cy.get('ion-select-option').should('have.length', poi_acquisition_form.length);
    cy.get('button.alert-radio-button').eq(1).click(); // seleziono un tipo di form
    cy.get('.alert-button-group > button').eq(1).should('be.visible').click(); // promo ok per confermare la scelta

    cy.get('wm-form > form > ion-item').should(
      'have.length',
      poi_acquisition_form[index_form_selected].fields.length + 1,
    );
  });

  it('should select all text in the title input and capitalize the first letter', () => {
    // Seleziona l'input del titolo
    cy.get('ion-input[ng-reflect-name="title"] input')
      .as('titleInput')
      .click()
      .then(input => {
        const el = input[0] as HTMLInputElement;
        // Verifica che tutto il testo sia selezionato
        const isTextSelected = el.selectionStart === 0 && el.selectionEnd === el.value.length;
        expect(isTextSelected).to.be.true;
      });

    // Inserisci un testo tutto in minuscolo
    cy.wait(300);
    const testoMinuscolo = 'testo di esempio';
    cy.get('@titleInput').type(testoMinuscolo);

    // Verifica che la prima lettera sia maiuscola
    cy.get('@titleInput').should('have.value', 'Testo di esempio');
  });
});
