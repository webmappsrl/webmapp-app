import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IGeojsonCluster } from 'src/app/types/model';

@Component({
  selector: 'webmapp-cluster-marker',
  templateUrl: './cluster-marker.component.html',
  styleUrls: ['./cluster-marker.component.scss'],
})
export class ClusterMarkerComponent implements OnInit {

  @Output('clickcluster') clickcluster: EventEmitter<IGeojsonCluster> =
    new EventEmitter<IGeojsonCluster>();

  public img1: string;
  public img2: string;
  public img3: string;
  public count: number;
  public id: string;
  private _item: IGeojsonCluster;

  @Input('item') set item(value: IGeojsonCluster) {
    this._item = value;
    this.img1 = value.properties.images[0];
    if (value.properties.images.length > 1) {
      this.img2 = value.properties.images[1];
    }
    if (value.properties.images.length > 2) {
      this.img3 = value.properties.images[2];
    }
    this.count = value.properties.ids.length;
    this.id = value.properties.ids.join('-');
  }


  constructor() { }

  ngOnInit() { }

  click() {
    this.clickcluster.emit(this._item);
  }

  private async getB64img(url: string): Promise<string | ArrayBuffer> {
    if (!url) { return null; }
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      }
    });
  }

  public async createMarkerHtmlForCanvas(): Promise<string> {



    let img1b64: string | ArrayBuffer = await this.getB64img(this.img1);
    let img2b64: string | ArrayBuffer = await this.getB64img(this.img2);
    let img3b64: string | ArrayBuffer = await this.getB64img(this.img3);
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

    if (this.count > 1) {
      html += ` 
      <div class="webmapp-map-clustermarker-counter" style="position: absolute;
        width: 24px;
        height: 20px;
        top: 0px;
        text-align: center;
        left: 55px;
        background-color: #508aa8;
        color: #FFF;
        border-radius: 50%;
        border: 2px solid #FFF;
        padding-top: 4px;
        font-family: arial;
        font-size: 12px;">${this.count}</div>
      

      `
    }

    // html += `  <div class="webmapp-map-clustermarker-clickarea" (click)="click()"></div>`

    html += ` </div>`
    // console.log('------- ~ file: cluster-marker.component.ts ~ line 123 ~ html', html);
    return html;
  }

}
