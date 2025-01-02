import {Injectable} from '@angular/core';
import {IGeojsonCluster, IGeojsonPoi} from '../types/model';
import defaultImage from '../../assets/images/defaultImageB64.json';
import {getImg} from '@wm-core/utils/localForage';
@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  public clusterMarkerSize = 100;
  public poiMarkerSize = 46;
  public trackMarkerSize = 32;

  public async createClusterMarkerHtmlForCanvas(
    value: IGeojsonCluster,
    isFavourite: boolean,
  ): Promise<string> {
    let img2b64: string | ArrayBuffer = null;
    let img3b64: string | ArrayBuffer = null;

    let img1b64: string | ArrayBuffer = await getImg(value.properties.images[0]);
    if (value.properties.images.length > 1) {
      img2b64 = await getImg(value.properties.images[1]);
    }
    if (value.properties.images.length > 2) {
      img3b64 = await getImg(value.properties.images[2]);
    }
    const clusterCount = value.properties.ids.length;

    let html = `
    <div class="webmapp-map-clustermarker-container" style="position: relative;width: 30px;height: 60px;">`;

    if (img2b64) {
      html += `
  <svg viewBox="0 0 61 67" fill="none"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="webmapp-map-clustermarker-img webmapp-map-clustermarker-img2"  style="position:absolute; width: 51px;  height: 57px;  left: 0px;  top: 5px;" >
    <path
      d="M26 2.75278C28.7846 1.14508 32.2154 1.14508 35 2.75278L54.8779 14.2293C57.6625 15.837 59.3779 18.8081 59.3779 22.0235V44.9765C59.3779 48.1919 57.6625 51.163 54.8779 52.7707L35 64.2472C32.2154 65.8549 28.7846 65.8549 26 64.2472L6.12212 52.7707C3.33751 51.163 1.62212 48.1919 1.62212 44.9765V22.0235C1.62212 18.8081 3.33751 15.837 6.12212 14.2293L26 2.75278Z"
       stroke="white" stroke-width="2" fill="url(#img2)"></path>
    <defs>
      <pattern height="100%" width="100%" patternContentUnits="objectBoundingBox" id="img2" >
        <image height="1" width="1" preserveAspectRatio="xMidYMid slice"  xlink:href="${img2b64}">
        </image>
      </pattern>
    </defs>
  </svg>`;
    }

    if (img3b64) {
      html += `<svg  viewBox="0 0 61 67" fill="none"
    xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  class="webmapp-map-clustermarker-img webmapp-map-clustermarker-img3"  style="position:absolute; width: 51px;  height: 57px;  left: 41px;  top: 5px;">
    <path
      d="M26 2.75278C28.7846 1.14508 32.2154 1.14508 35 2.75278L54.8779 14.2293C57.6625 15.837 59.3779 18.8081 59.3779 22.0235V44.9765C59.3779 48.1919 57.6625 51.163 54.8779 52.7707L35 64.2472C32.2154 65.8549 28.7846 65.8549 26 64.2472L6.12212 52.7707C3.33751 51.163 1.62212 48.1919 1.62212 44.9765V22.0235C1.62212 18.8081 3.33751 15.837 6.12212 14.2293L26 2.75278Z"
       stroke="white" stroke-width="2" fill="url(#img3)"></path>
    <defs>
      <pattern height="100%" width="100%" patternContentUnits="objectBoundingBox" id="img3" >
        <image height="1" width="1" preserveAspectRatio="xMidYMid slice" xlink:href="${img3b64}">
        </image>
      </pattern>
    </defs>
  </svg>`;
    }

    html += `<svg viewBox="0 0 61 67" fill="none" xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink" class="webmapp-map-clustermarker-img"  style=" position: absolute;  width: 61px;  height: 67px;  left: 16px;  top: 0px;">
     <path
          d="M26 2.75278C28.7846 1.14508 32.2154 1.14508 35 2.75278L54.8779 14.2293C57.6625 15.837 59.3779 18.8081 59.3779 22.0235V44.9765C59.3779 48.1919 57.6625 51.163 54.8779 52.7707L35 64.2472C32.2154 65.8549 28.7846 65.8549 26 64.2472L6.12212 52.7707C3.33751 51.163 1.62212 48.1919 1.62212 44.9765V22.0235C1.62212 18.8081 3.33751 15.837 6.12212 14.2293L26 2.75278Z"
          stroke="white" stroke-width="2" fill="url(#img)">
      </path>
      <defs>
          <pattern height="100%" width="100%" patternContentUnits="objectBoundingBox" id="img">
              <image height="1" width="1" preserveAspectRatio="xMidYMid slice" xlink:href="${img1b64}">
              </image>
          </pattern>
      </defs>
  </svg>`;

    if (clusterCount > 1) {
      html += `
      <div class="webmapp-map-clustermarker-counter" style="position: absolute;
        width: 24px;
        height: 20px;
        top: 0px;
        text-align: center;
        left: 55px;
        background-color: #323031;
        color: #FFF;
        border-radius: 50%;
        border: 2px solid #FFF;
        padding-top: 5px;
        padding-left: 1px;
        font-family: arial;
        font-weight: bold;
        font-size: 12px;">${clusterCount}</div>

      `;
    }

    if (isFavourite) {
      html += `

      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style=" position: absolute;  width: 18px;  height: 18px;  left: 60px;  top: 0px;">
<path d="M5.00435 2.11466L5.00411 2.11473C1.90297 3.08352 0.620151 6.34665 1.59781 9.29349L1.60144 9.30441L1.60531 9.31526C2.07938 10.6412 2.85055 11.833 3.86254 12.8098L3.86249 12.8099L3.87121 12.8181C5.16127 14.0338 6.57846 15.1036 8.1016 16.0124L8.10157 16.0125L8.11164 16.0184L8.27754 16.1147L8.2777 16.1148C8.75204 16.3903 9.34125 16.3857 9.81126 16.1022L9.96209 16.0112C9.96275 16.0108 9.9634 16.0105 9.96406 16.0101C11.4844 15.1027 12.9009 14.0334 14.1862 12.8222L14.1863 12.8222L14.1949 12.8139C15.2104 11.8337 15.9819 10.6422 16.4528 9.3256L16.4567 9.31474L16.4603 9.30378C17.4412 6.34785 16.1533 3.0837 13.0517 2.11477L13.0415 2.11157L13.0312 2.10858L12.8517 2.05671L12.8418 2.05387L12.8319 2.05123C11.5558 1.71066 10.2058 1.83754 9.02842 2.39302C7.78138 1.80383 6.3421 1.69712 5.00435 2.11466Z" fill="#FF8128" stroke="white" stroke-width="2"/>
</svg>
      `;
    }

    html += ` </div>`;

    return html;
  }

  public async createEndTrackMarkerHtmlForCanvas(value: IGeojsonPoi): Promise<string> {
    let html = ` <div class="webmapp-map-clustermarker-container" style="position: relative;width: 32px;height: 32px; ">`;
    html += `<svg id="Livello_1" data-name="Livello 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74 74"><path d="M14.82,4.51a3,3,0,0,1,2.95,3V9.64A33.47,33.47,0,0,0,32.21,8.8,35.64,35.64,0,0,1,50,8.4a2.8,2.8,0,0,1,2.1,2.76V34.83a3,3,0,0,1-3.49,3,44,44,0,0,0-16,.41A44.59,44.59,0,0,1,22.21,39a35.1,35.1,0,0,1-4.44-.46v18a2.95,2.95,0,1,1-5.89,0V7.46A2.94,2.94,0,0,1,14.82,4.51Z" style="fill:#2f9e44;fill-rule:evenodd"/><path d="M14.82,4.51a3,3,0,0,1,2.95,3V9.64a36.08,36.08,0,0,0,5.45.42,31.41,31.41,0,0,0,9-1.26,33.4,33.4,0,0,1,9.55-1.34A35.38,35.38,0,0,1,50,8.4a2.8,2.8,0,0,1,2.1,2.76V34.83a3,3,0,0,1-3,3l-.48,0a43.21,43.21,0,0,0-6.74-.54,47,47,0,0,0-9.21.95A44.47,44.47,0,0,1,24.1,39c-.64,0-1.28,0-1.89,0a35.1,35.1,0,0,1-4.44-.46v18a2.95,2.95,0,1,1-5.89,0V7.46a2.94,2.94,0,0,1,2.94-2.95m0-2.87A5.83,5.83,0,0,0,9,7.46V56.54a5.82,5.82,0,0,0,11.64,0V41.77l1.44.08c.67,0,1.34,0,2,0A47.48,47.48,0,0,0,33.25,41a43.75,43.75,0,0,1,8.64-.9,40.11,40.11,0,0,1,6.3.51,7,7,0,0,0,.92.07A5.88,5.88,0,0,0,55,34.83V11.16a5.68,5.68,0,0,0-4.29-5.55,37.89,37.89,0,0,0-9-1A35.82,35.82,0,0,0,31.38,6.05a28.53,28.53,0,0,1-8.16,1.13c-.87,0-1.73,0-2.59-.1a5.84,5.84,0,0,0-5.81-5.44Z" style="fill:#fff"/></svg>`;
    html += `</div>`;

    return html;
  }

  public async createPoiMarkerHtmlForCanvas(value: any, selected = false): Promise<string> {
    const img1b64: string | ArrayBuffer = await this._downloadBase64Img(
      value.properties?.feature_image?.sizes['108x137'],
    );
    let html = `
    <div class="webmapp-map-poimarker-container" style="position: relative;width: 30px;height: 60px;">`;

    if (!value.isSmall) {
      html += `
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style=" position: absolute;  width: 46px;  height: 46px;  left: 0px;  top: 0px;">
          <circle opacity="${selected ? 1 : 0.2}" cx="23" cy="23" r="23" fill="#2F9E44"/>
          <rect x="5" y="5" width="36" height="36" rx="18" fill="url(#img)" stroke="white" stroke-width="2"/>
          <defs>
            <pattern height="100%" width="100%" patternContentUnits="objectBoundingBox" id="img">
              <image height="1" width="1" preserveAspectRatio="xMidYMid slice" xlink:href="${img1b64}">
              </image>
            </pattern>
          </defs>
        </svg>`;
    } else {
      html += `

      <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle opacity="${
        selected ? 1 : 0.2
      }" cx="23.3187" cy="23.319" r="13.0967" transform="rotate(0.981294 13.3187 13.319)" fill="#2F9E44"/>
<rect x="17.32812" y="17.11877" width="12" height="12" rx="6" transform="rotate(0.981294 7.32812 7.11877)" fill="#2F9E44" stroke="white" stroke-width="2"/>
</svg>
      `;
    }

    html += ` </div>`;

    return html;
  }

  public async createStartTrackMarkerHtmlForCanvas(value: IGeojsonPoi): Promise<string> {
    let html = ` <div class="webmapp-map-clustermarker-container" style="position: relative;width: 32px;height: 32px; ">`;
    html += `<svg id="Livello_1" data-name="Livello 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 74 74"><path d="M32,63.5a6.42,6.42,0,0,1-3.47-1.11,64.93,64.93,0,0,1-16.7-15.51,32.63,32.63,0,0,1-7-19.76C4.88,12.44,17,.5,32,.5S59.12,12.44,59.12,27.12a32.65,32.65,0,0,1-7,19.77A66.08,66.08,0,0,1,35.47,62.38,6.25,6.25,0,0,1,32,63.5Z" style="fill:#fff"/><path d="M32,5.5A21.89,21.89,0,0,0,9.88,27.12a27.61,27.61,0,0,0,5.95,16.74h0A60,60,0,0,0,31.24,58.18c.7.45.91.4,1.5,0A61,61,0,0,0,48.17,43.86a27.61,27.61,0,0,0,5.95-16.74C54.12,15.2,44.19,5.5,32,5.5Z" style="fill:#2f9e44"/><path d="M32,42.05A14.25,14.25,0,1,1,46.32,27.87,14.25,14.25,0,0,1,32,42.05Zm0-23.49a9.25,9.25,0,1,0,9.34,9.31A9.32,9.32,0,0,0,32,18.56Z" style="fill:#fff"/></svg>`;
    html += `</div>`;

    return html;
  }

  private async _downloadBase64Img(url): Promise<string | ArrayBuffer> {
    if (url == null) {
      return defaultImage.image;
    }
    const opt = {};
    const data = await fetch(url, opt);
    const blob = await data.blob();
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      try {
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      } catch (error) {
        resolve('');
      }
    });
  }
}
