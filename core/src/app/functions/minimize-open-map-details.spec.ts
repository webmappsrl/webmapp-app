import {Store} from '@ngrx/store';
import {setMapDetailsStatus} from '@wm-core/store/user-activity/user-activity.action';
import {mapDetailsStatus} from '@wm-core/store/user-activity/user-activity.reducer';
import {of} from 'rxjs';

import {minimizeOpenMapDetails} from './minimize-open-map-details';

describe('minimizeOpenMapDetails (oc:8762)', () => {
  function run(status: mapDetailsStatus): jasmine.SpyObj<Store> {
    const storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
    storeSpy.select.and.returnValue(of(status));
    minimizeOpenMapDetails(storeSpy);
    return storeSpy;
  }

  it('pannello aperto: lo riduce al titolo', () => {
    expect(run('open').dispatch).toHaveBeenCalledOnceWith(
      setMapDetailsStatus({status: 'onlyTitle'}),
    );
  });

  it('pannello a tutto schermo: lo riduce al titolo', () => {
    expect(run('full').dispatch).toHaveBeenCalledOnceWith(
      setMapDetailsStatus({status: 'onlyTitle'}),
    );
  });

  it('pannello chiuso: resta chiuso', () => {
    expect(run('background').dispatch).not.toHaveBeenCalled();
  });

  it('pannello già ridotto al titolo: nessuna azione', () => {
    expect(run('onlyTitle').dispatch).not.toHaveBeenCalled();
  });
});
