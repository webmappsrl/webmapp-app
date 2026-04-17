import {Inject, Injectable, Optional} from '@angular/core';
import {Share} from '@capacitor/share';
import {LangService} from '@wm-core/localization/lang.service';
import {Feature, LineString} from 'geojson';
import {EnvironmentService} from '@wm-core/services/environment.service';
import {POSTHOG_CLIENT} from '@wm-core/store/conf/conf.token';
import {WmPosthogClient} from '@wm-types/posthog';

export interface ShareObject {
  dialogTitle?: string;
  id?: number;
  text?: string;
  title?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private _baseLink;
  private _host;
  private defaultShareObj: ShareObject = {
    title: 'See cool stuff',
    text: '',
    url: 'www.cai.it',
    dialogTitle: 'Share with buddies',
  };

  constructor(
    private _translate: LangService,
    private _environmentSvc: EnvironmentService,
    @Optional() @Inject(POSTHOG_CLIENT) private _posthogClient?: WmPosthogClient,
  ) {
    this._baseLink = this._environmentSvc.shareLink;

    this._translate
      .get(['services.share.title', 'services.share.url', 'services.share.dialogTitle'])
      .subscribe(t => {
        this.defaultShareObj.title = t['services.share.title'];
        this.defaultShareObj.url = t['services.share.url'];
        this.defaultShareObj.dialogTitle = t['services.share.dialogTitle'];
      });
  }

  /**
   *
   * Share something with the app sharing system
   * @param shareObj Info about wht to share
   */
  public async share(shareObj: ShareObject) {
    const so = Object.assign(this.defaultShareObj, shareObj);
    let shareRet = await Share.share(so);
    console.log(
      '------- ~ file: share.service.ts ~ line 20 ~ ShareService ~ share ~ shareRet',
      shareRet,
    );
  }

  public sharePoiByID(poiId: number): void {
    this._posthogClient?.capture('contentShared', {
      content_type: 'poi',
      content_id: `${poiId}`,
    });
    this.share({
      url: `https://${this._baseLink}/map?poi=${poiId}`,
    });
  }

  public async shareRoute(route: Feature<LineString>): Promise<void> {
    this._posthogClient?.capture('contentShared', {
      content_type: 'track',
      content_id: `${route.properties.id}`,
    });
    return this.share({
      url: `${this._environmentSvc.origin}/track/${route.properties.id}`,
    });
  }

  public shareTrackByID(trackId: number): void {
    this._posthogClient?.capture('contentShared', {
      content_type: 'track',
      content_id: `${trackId}`,
    });
    this.share({
      url: `https://${this._baseLink}/map?track=${trackId}`,
    });
  }
}
