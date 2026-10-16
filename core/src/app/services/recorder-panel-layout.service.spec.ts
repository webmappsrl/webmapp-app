import {RecorderPanelLayoutService} from './recorder-panel-layout.service';

/** Bordo inferiore della plancia di registrazione, letto dall'avviso GPS. */
describe('RecorderPanelLayoutService', () => {
  let svc: RecorderPanelLayoutService;
  let values: (number | null)[];

  beforeEach(() => {
    svc = new RecorderPanelLayoutService();
    values = [];
    svc.panelBottom$.subscribe(v => values.push(v));
  });

  it('parte da null', () => {
    expect(values).toEqual([null]);
  });

  it('emette il valore impostato', () => {
    svc.setPanelBottom(180);
    expect(values).toEqual([null, 180]);
  });

  it('non riemette lo stesso valore', () => {
    svc.setPanelBottom(180);
    svc.setPanelBottom(180);
    svc.setPanelBottom(null);
    expect(values).toEqual([null, 180, null]);
  });
});
