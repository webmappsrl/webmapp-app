import { Component, OnInit } from '@angular/core';
import { pointerMove } from 'ol/events/condition';
import { UtilsService } from 'src/app/services/utils.service';
import { IGeojsonPoi } from 'src/app/types/model';

@Component({
  selector: 'app-poi-marker',
  templateUrl: './poi-marker.component.html',
  styleUrls: ['./poi-marker.component.scss'],
})
export class PoiMarkerComponent implements OnInit {

  public static markerSize = 46;

  constructor() { }

  ngOnInit() { }

  public static async createMarkerHtmlForCanvas(value: IGeojsonPoi): Promise<string> {

    let img1b64: string | ArrayBuffer = !value.isSmall ? await UtilsService.getB64img(value.properties.image) : '';


    let html = `
    <div class="webmapp-map-clustermarker-container" style="position: relative;width: 30px;height: 60px;">`;

    if (!value.isSmall) {
      html += `
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style=" position: absolute;  width: 46px;  height: 46px;  left: 0px;  top: 0px;">
          <circle opacity="0.2" cx="23" cy="23" r="23" fill="#FFB100"/>
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
<circle opacity="0.2" cx="23.3187" cy="23.319" r="13.0967" transform="rotate(0.981294 13.3187 13.319)" fill="#FFB100"/>
<rect x="17.32812" y="17.11877" width="12" height="12" rx="6" transform="rotate(0.981294 7.32812 7.11877)" fill="#FFB100" stroke="white" stroke-width="2"/>
</svg>    
      `
    }

    html += ` </div>`

    return html;
  }

}
