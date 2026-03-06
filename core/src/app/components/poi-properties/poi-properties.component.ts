import {Component, ChangeDetectionStrategy, Input, ViewEncapsulation} from '@angular/core';
import {GeolocationService} from '@wm-core/services/geolocation.service';
import {Store} from '@ngrx/store';
import {BehaviorSubject, Observable} from 'rxjs';
import {currentPoiProperties} from '@wm-core/store/features/ec/ec.selector';
import {tap} from 'rxjs/internal/operators/tap';
import {poi} from '@wm-core/store/features/features.selector';
import {switchMap} from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';
import {confOPTIONSShowEmbeddedHtml, confPOIFORMS} from '@wm-core/store/conf/conf.selector';
import {UntypedFormGroup} from '@angular/forms';
@Component({
  standalone: false,
  selector: 'wm-poi-properties',
  templateUrl: './poi-properties.component.html',
  styleUrls: ['./poi-properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PoiPropertiesComponent {
  confOPTIONSShowEmbeddedHtml$ = this._store.select(confOPTIONSShowEmbeddedHtml);
  confPOIFORMS$: Observable<any[]> = this._store.select(confPOIFORMS);
  formGroup: UntypedFormGroup;
  currentPoiProperties$ = this._store.select(currentPoiProperties).pipe(
    tap(properties => {
      this.showTechnicalDetails$.next(properties?.ele || properties?.address);
      this.showUsefulUrls$.next(
        properties?.contact_phone || properties?.contact_email || properties?.related_url,
      );
    }),
  );
  distanceFromCurrentPoi$ = this._store
    .select(poi)
    .pipe(
      switchMap(poi =>
        this._geolocationSvc.getDistanceFromCurrentLocation$(poi?.geometry?.coordinates),
      ),
    );
  showTechnicalDetails$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  showUsefulUrls$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private _store: Store,
    private _geolocationSvc: GeolocationService,
    private _sanitizer: DomSanitizer,
  ) {}

  sanitize(html: string) {
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }
}
