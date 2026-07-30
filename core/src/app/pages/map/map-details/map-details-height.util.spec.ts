import {computeTargetHeight} from './map-details-height.util';

describe('computeTargetHeight (oc:8313)', () => {
  it('in stato "open" con contenuto più corto di 320px, resta a 320px (floor == ceiling)', () => {
    expect(computeTargetHeight(100, 56, 320, 320)).toBe(320);
  });

  it('in stato "open" con contenuto più alto di 320px, resta a 320px con scroll interno (floor == ceiling)', () => {
    expect(computeTargetHeight(500, 56, 320, 320)).toBe(320);
  });

  it('in stato "full" con contenuto più corto del floor, si ferma al floor (320px)', () => {
    expect(computeTargetHeight(100, 56, 320, 900)).toBe(320);
  });

  it('in stato "full" con contenuto tra floor e ceiling, si adatta al contenuto reale', () => {
    expect(computeTargetHeight(700, 56, 320, 900)).toBe(756);
  });

  it('in stato "full" con contenuto più alto del ceiling, si ferma al ceiling', () => {
    expect(computeTargetHeight(1000, 56, 320, 900)).toBe(900);
  });
});
