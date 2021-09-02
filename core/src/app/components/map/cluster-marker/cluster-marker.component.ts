import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GeohubService } from 'src/app/services/geohub.service';
import { UtilsService } from 'src/app/services/utils.service';
import { IGeojsonCluster } from 'src/app/types/model';

@Component({
  selector: 'webmapp-cluster-marker',
  templateUrl: './cluster-marker.component.html',
  styleUrls: ['./cluster-marker.component.scss'],
})
export class ClusterMarkerComponent implements OnInit {

  public static markerSize = 100;

  @Output('clickcluster') clickcluster: EventEmitter<IGeojsonCluster> =
    new EventEmitter<IGeojsonCluster>();

  public img1: string;
  public img2: string;
  public img3: string;
  public count: number;
  public id: string;
  public isFavourite: boolean = false;
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

    if (this.count == 1)
      this._geoHubService.isFavouriteTrack(value.properties.ids[0]).then(b => {
        this.isFavourite = b;
      })
  }


  constructor(
    private _geoHubService: GeohubService
  ) { }

  ngOnInit() { }

  click() {
    this.clickcluster.emit(this._item);
  }

  

  public static async createMarkerHtmlForCanvas(value: IGeojsonCluster, isFavourite: boolean): Promise<string> {

    let img2b64: string | ArrayBuffer = null;
    let img3b64: string | ArrayBuffer = null;

    let img1b64: string | ArrayBuffer = await UtilsService.getB64img(value.properties.images[0]);
    if (value.properties.images.length > 1) {
      img2b64 = await UtilsService.getB64img(value.properties.images[1]);
    }
    if (value.properties.images.length > 2) {
      img3b64 = await UtilsService.getB64img(value.properties.images[2]);
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
        background-color: #508aa8;
        color: #FFF;
        border-radius: 50%;
        border: 2px solid #FFF;
        padding-top: 4px;
        font-family: arial;
        font-size: 12px;">${clusterCount}</div>
      

      `
    }

    if (isFavourite) {
      html += ` 

      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style=" position: absolute;  width: 18px;  height: 18px;  left: 60px;  top: 0px;">
<path d="M5.00435 2.11466L5.00411 2.11473C1.90297 3.08352 0.620151 6.34665 1.59781 9.29349L1.60144 9.30441L1.60531 9.31526C2.07938 10.6412 2.85055 11.833 3.86254 12.8098L3.86249 12.8099L3.87121 12.8181C5.16127 14.0338 6.57846 15.1036 8.1016 16.0124L8.10157 16.0125L8.11164 16.0184L8.27754 16.1147L8.2777 16.1148C8.75204 16.3903 9.34125 16.3857 9.81126 16.1022L9.96209 16.0112C9.96275 16.0108 9.9634 16.0105 9.96406 16.0101C11.4844 15.1027 12.9009 14.0334 14.1862 12.8222L14.1863 12.8222L14.1949 12.8139C15.2104 11.8337 15.9819 10.6422 16.4528 9.3256L16.4567 9.31474L16.4603 9.30378C17.4412 6.34785 16.1533 3.0837 13.0517 2.11477L13.0415 2.11157L13.0312 2.10858L12.8517 2.05671L12.8418 2.05387L12.8319 2.05123C11.5558 1.71066 10.2058 1.83754 9.02842 2.39302C7.78138 1.80383 6.3421 1.69712 5.00435 2.11466Z" fill="#FF7E6B" stroke="white" stroke-width="2"/>
</svg>      
      `
    }

    html += ` </div>`

    return html;
  }

}
