import {confURL, goHome, goMap} from 'cypress/utils/test-utils';

const minDistance = 13;
const maxDistance = 30;
const labelDistance = 'Distance';

const minDuration = 30;
const maxDuration = 120;
const labelDuration = 'Outward Duration';

const waitFilterResults = 500;

const filters = {
  track_duration: {
    type: 'slider',
    identifier: 'duration_forward',
    name: {it: 'Tempo di percorrenza', en: 'Travel time'},
    units: 'min',
    steps: 30,
    min: 30,
    max: 900,
  },
  track_distance: {
    type: 'slider',
    identifier: 'distance',
    name: {it: 'Lunghezza del sentiero', en: 'Path length'},
    units: 'km',
    steps: 1,
    min: 1,
    max: 30,
  },
};

describe('Distance and duration filters [oc:4726] [https://orchestrator.maphub.it/resources/developer-stories/4726]', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.intercept('GET', confURL, req => {
      req.reply(res => {
        const newRes = {
          ...res.body,
          MAP: {
            ...res.body.MAP,
            filters,
          },
        };
        res.send(newRes);
      });
    }).as('getConf');

    cy.visit('/');
  });

  it('Should correctly work distance filter', () => {
    cy.wait('@getConf');
    goMap();

    const {track_distance} = filters;
    const {max, min, steps, name} = track_distance;
    const labelFilterDistance = name?.en ?? '';
    openAFilter(labelFilterDistance);
    cy.get('@filter').as('distanceFilter');

    setSliderFilter('distanceFilter', max, min, steps, maxDistance, minDistance);

    goHome(false);
    cy.wait(waitFilterResults);
    cy.get('wm-home wm-search-box').each($el => {
      cy.wrap($el).click();
      cy.get('wm-tab-detail ion-item')
        .contains('ion-label', labelDistance)
        .parents('ion-item')
        .within(() => {
          cy.get('ion-note').then($note => {
            const distance = $note.text();
            const distanceNumber = parseFloat(distance);
            expect(distanceNumber).to.be.greaterThan(minDistance);
            expect(distanceNumber).to.be.lessThan(maxDistance);
          });
        });
      goHome(false);
    });
  });

  it('Should correctly work duration filter', () => {
    goMap();

    const {track_duration} = filters;
    const {max, min, steps, name} = track_duration;
    const labelFilterDuration = name?.en ?? '';
    openAFilter(labelFilterDuration);
    cy.get('@filter').as('durationFilter');

    setSliderFilter('durationFilter', max, min, steps, maxDuration, minDuration);

    goHome(false);
    cy.wait(waitFilterResults);
    cy.get('wm-home wm-search-box').each($el => {
      cy.wrap($el).click();
      cy.get('wm-tab-detail ion-item')
        .contains('ion-label', labelDuration)
        .parents('ion-item')
        .within(() => {
          cy.get('ion-note').then($note => {
            const duration = $note.text();
            const durationNumber = convertDurationToMinutes(duration);
            expect(durationNumber).to.be.greaterThan(minDuration);
            expect(durationNumber).to.be.lessThan(maxDuration);
          });
        });
      goHome(false);
    });
  });
});

function openAFilter(label: string) {
  cy.get('wm-filters').click();
  cy.get('wm-slider-filter ion-accordion')
    .contains('ion-label', label)
    .parents('ion-accordion')
    .then($accordion => {
      cy.wrap($accordion).as('filter');
      cy.get('@filter').click();
    });
}

function setSliderFilter(
  filterAlias: string,
  max: number,
  min: number,
  steps: number,
  maxValue: number,
  minValue: number,
) {
  cy.get(`@${filterAlias}`).within(() => {
    cy.get('ion-range')
      .shadow()
      .find('.range-slider')
      .then($slider => {
        const sliderWidth = $slider[0]?.getBoundingClientRect()?.width ?? 0;
        const ticks = (max - min) / steps + 1;
        const clickPositionMax =
          Math.floor(((maxValue / steps - 1) / (ticks - 1)) * sliderWidth) - 1;
        const clickPositionMin =
          Math.floor(((minValue / steps - 1) / (ticks - 1)) * sliderWidth) - 1;

        cy.wrap($slider).click(clickPositionMax, 10);
        cy.wrap($slider).click(clickPositionMin, 10);
      });
  });
}

function convertDurationToMinutes(duration: string): number {
  let hours = 0;
  let minutes = 0;

  const hoursMatch = duration.match(/(\d+)\s*h/);
  const minutesMatch = duration.match(/(\d+)\s*m/);

  if (hoursMatch) {
    hours = parseInt(hoursMatch[1], 10);
  }
  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1], 10);
  }

  return hours * 60 + minutes;
}
