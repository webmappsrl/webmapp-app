import {Injectable} from '@angular/core';
import {Share} from '@capacitor/share';
import {environment} from 'src/environments/environment';
import {LangService} from '@wm-core/localization/lang.service';
import {ConfService} from '@wm-core/store/conf/conf.service';
import {Feature, LineString} from 'geojson';

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
    url: 'www.webmapp.it',
    dialogTitle: 'Share with buddies',
  };

  constructor(private _translate: LangService, private _confSvc: ConfService) {
    this._host = this._confSvc.getHost();
    this._baseLink = this._host ? this._host : `${this._confSvc.geohubAppId}.app.webmapp.it`;

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
    this.share({
      url: `https://${this._baseLink}/map?poi=${poiId}`,
    });
  }

  public async shareRoute(route: Feature<LineString>): Promise<void> {
    return this.share({
      url: `${DEFAULT_ROUTE_LINK_BASEURL}${route.properties.id}`,
    });
  }

  public shareTrackByID(trackId: number): void {
    this.share({
      url: `https://${this._baseLink}/map?track=${trackId}`,
    });
  }
}

const DEFAULT_ROUTE_LINK_BASEURL = `${environment.api}/track/`;
