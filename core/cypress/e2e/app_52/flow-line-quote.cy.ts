import {confURL, data, openLayer, openTrack} from 'cypress/utils/test-utils';

const flowLineQuoteConfig = {
  flow_line_quote_show: true,
  flow_line_quote_orange: 1000,
  flow_line_quote_red: 1200,
};

describe('Flow line quote [oc:4727] [https://orchestrator.maphub.it/resources/developer-stories/4727]', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          MAP: {
            ...res.body.MAP,
            ...flowLineQuoteConfig,
          },
        };
        res.send(newRes);
      });
    }).as('getConf');
    cy.visit('/');
  });

  it('Should show correct flow line quote', () => {
    cy.wait('@getConf');
    openLayer(data.layers.ecTrack);
    openTrack(data.tracks.exampleOne);

    cy.get('.wm-flowline').should('exist').as('flowline');

    cy.get('.webmapp-slopechart-canvas')
      .should('exist')
      .then(canvas => {
        const canvasWidth = canvas.width();
        const canvasHeight = canvas.height();
        const {flow_line_quote_red, flow_line_quote_orange} = flowLineQuoteConfig;
        // click livel 3:
        cy.wrap(canvas).click(canvasWidth * 0.25, canvasHeight * 0.5);
        cy.get('@flowline').should(
          'contain.text',
          `Level 3: in high altitude (altitude above ${flow_line_quote_red} meters)`,
        );

        // click livel 2:
        cy.wrap(canvas).click(canvasWidth * 0.5, canvasHeight * 0.5);
        cy.get('@flowline').should(
          'contain.text',
          `Level 2: sections partially in high altitude (altitude between ${flow_line_quote_orange} meters and ${flow_line_quote_red} meters)`,
        );

        // click livel 1:
        cy.wrap(canvas).click(canvasWidth * 0.75, canvasHeight * 0.5);
        cy.get('@flowline').should(
          'contain.text',
          `Level 1: sections not affected by high altitude (altitude less than ${flow_line_quote_orange} meters)`,
        );
      });
  });
});
