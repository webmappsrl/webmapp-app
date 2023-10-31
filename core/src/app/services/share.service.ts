import {IGeojsonFeature} from '../types/model';
import {Injectable} from '@angular/core';
import {Share} from '@capacitor/share';
import {environment} from 'src/environments/environment';
import {LangService} from 'wm-core/localization/lang.service';
import {ConfService} from 'wm-core/store/conf/conf.service';
const DEFAULT_ROUTE_LINK_BASEURL = `${environment.api}/track/`;

export interface ShareObject {
  dialogTitle?: string;
  text?: string;
  title?: string;
  url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private defaultShareObj: ShareObject = {
    title: 'See cool stuff',
    text: 'Really awesome thing you need to see right meow',
    url: 'www.webmapp.it',
    dialogTitle: 'Share with buddies',
  };

  constructor(private _translate: LangService, private _confSvc: ConfService) {
    this._translate
      .get([
        'services.share.title',
        'services.share.text',
        'services.share.url',
        'services.share.dialogTitle',
      ])
      .subscribe(t => {
        this.defaultShareObj.title = t['services.share.title'];
        this.defaultShareObj.text = t['services.share.text'];
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

  public async shareRoute(route: IGeojsonFeature) {
    return this.share({
      url: `${DEFAULT_ROUTE_LINK_BASEURL}${route.properties.id}`,
    });
  }

  public async shareTrackByID(id: number) {
    return this.share({
      url: `${DEFAULT_ROUTE_LINK_BASEURL}${id}?app_id=${this._confSvc.geohubAppId}`,
    });
  }
}
