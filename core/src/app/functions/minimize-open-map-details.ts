import {Store} from '@ngrx/store';
import {setMapDetailsStatus} from '@wm-core/store/user-activity/user-activity.action';
import {mapDetailsStatus} from '@wm-core/store/user-activity/user-activity.selector';
import {take} from 'rxjs/operators';

/**
 * Riduce al solo titolo il pannello di dettaglio della mappa, ma solo se è aperto (`open` o
 * `full`), così la mappa resta visibile durante la registrazione. Un pannello chiuso
 * (`background`) resta chiuso: passarlo a `onlyTitle` lo farebbe apparire (oc:8762).
 *
 * @param store lo store NgRx da cui leggere lo stato del pannello.
 */
export function minimizeOpenMapDetails(store: Store): void {
  store
    .select(mapDetailsStatus)
    .pipe(take(1))
    .subscribe(status => {
      if (status === 'open' || status === 'full') {
        store.dispatch(setMapDetailsStatus({status: 'onlyTitle'}));
      }
    });
}
