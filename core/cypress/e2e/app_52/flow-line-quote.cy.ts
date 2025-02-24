import {data, openLayer, openTrack} from 'cypress/utils/test-utils';
import {environment} from 'src/environments/environment';

const confURL = `${environment.awsApi}/conf/52.json`;
const flowLineQuoteConfig = {
  flow_line_quote_show: true,
  flow_line_quote_orange: 1000,
  flow_line_quote_red: 1200,
};

describe('Flow line quote', () => {
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
          'contain',
          `Livello 3: in alta quota (quota superiore ${flow_line_quote_red} metri)`,
        );

        // click livel 2:
        cy.wrap(canvas).click(canvasWidth * 0.5, canvasHeight * 0.5);
        cy.get('@flowline').should(
          'contain',
          `Livello 2: tratti parzialmente in alta quota (quota compresa tra ${flow_line_quote_orange} metri e ${flow_line_quote_red} metri)`,
        );

        // click livel 1:
        cy.wrap(canvas).click(canvasWidth * 0.75, canvasHeight * 0.5);
        cy.get('@flowline').should(
          'contain',
          `Livello 1: tratti non interessati dall'alta quota (quota minore di ${flow_line_quote_orange} metri)`,
        );
      });
  });
});
