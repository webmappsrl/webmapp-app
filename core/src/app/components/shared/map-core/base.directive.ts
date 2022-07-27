import {Directive, Input} from '@angular/core';
import {fromLonLat, transform} from 'ol/proj';

import {Extent} from 'ol/extent';
import Feature from 'ol/Feature';
import {FitOptions} from 'ol/View';
import Icon from 'ol/style/Icon';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import SimpleGeometry from 'ol/geom/SimpleGeometry';
import Style from 'ol/style/Style';
import {startIconHtml} from './icons';
import {transformExtent} from 'ol/proj';

@Directive()
export abstract class WmMapBaseDirective {
  @Input() map: Map;
  @Input() padding: number[];

  extentFromLonLat(extent: Extent): Extent {
    return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
  }

  fitView(geometryOrExtent: SimpleGeometry | Extent, optOptions?: FitOptions): void {
    if (this.map != null) {
      const view = this.map.getView();
      if (view != null) {
        if (optOptions == null) {
          optOptions = {
            padding: this.padding ?? undefined,
          };
        }
        view.fit(this.extentFromLonLat(geometryOrExtent as any), optOptions);
      }
    }
  }

  protected _createFeature(iconHtml: string, position: [number, number]): Feature {
    const feature = new Feature({
      geometry: new Point(fromLonLat(position)),
    });
    const style = new Style({
      image: new Icon({
        src: 'data:image/svg+xml;utf8,' + escape(iconHtml),
        anchor: [0.5, 0.5],
        imgSize: [32, 32],
        opacity: 1,
      }),
      zIndex: 1,
    });
    feature.setStyle(style);

    return feature;
  }
}
