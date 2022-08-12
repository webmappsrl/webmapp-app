import {Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import Feature, {FeatureLike} from 'ol/Feature';
import {ILAYER, IMAP} from 'src/app/types/config';
import {Interaction, defaults as defaultInteractions} from 'ol/interaction.js';
import SelectInteraction, {SelectEvent} from 'ol/interaction/Select';
import Style, {StyleLike} from 'ol/style/Style';
import {distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {endIconHtml, startIconHtml} from './icons';

import {BehaviorSubject} from 'rxjs';
import {Collection} from 'ol';
import {CommunicationService} from 'src/app/services/base/communication.service';
import {ConfService} from 'src/app/store/conf/conf.service';
import {DEF_LINE_COLOR} from './constants';
import Fill from 'ol/style/Fill';
import Geometry from 'ol/geom/Geometry';
import Layer from 'ol/layer/Layer';
import MVT from 'ol/format/MVT';
import Map from 'ol/Map';
import StrokeStyle from 'ol/style/Stroke';
import {TRACK_ZINDEX} from './zIndex';
import Text from 'ol/style/Text';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import {WmMapBaseDirective} from './base.directive';
import {styleJsonFn} from './utils';

@Directive({
  selector: '[wmMapLayer]',
})
export class WmMapLayerDirective extends WmMapBaseDirective implements OnChanges {
  private _dataLayers: Array<VectorTileLayer>;
  private _defaultFeatureColor = DEF_LINE_COLOR;
  private _disableLayers = false;
  private _flagFeatures: Feature<Geometry>[] = [];
  private _flagsLayer: VectorLayer;
  private _selectInteraction: SelectInteraction;
  private _styleJson: any;
  private _map$: BehaviorSubject<Map> = new BehaviorSubject<Map>(null);
  private _currentLayer$: BehaviorSubject<ILAYER> = new BehaviorSubject<ILAYER>(null);
  private _mapIsInit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Input() conf: IMAP;
  @Output() trackSelectedFromLayerEVT: EventEmitter<number> = new EventEmitter<number>();

  constructor(private _confSvc: ConfService, private _communicationSvc: CommunicationService) {
    super();

    this._mapIsInit$
      .pipe(
        filter(f => f),
        switchMap(_ => this._currentLayer$),
        distinctUntilChanged(),
      )
      .subscribe(l => {
        if (l != null && l.bbox != null) {
          this.fitView(l.bbox);
        } else if (this.conf != null && this.conf.bbox != null) {
          this.fitView(this.conf.bbox);
        }
      });
  }

  @Input() set disableLayers(disable: boolean) {
    this._disableLayers = disable;
    if (this._dataLayers != null) {
      this._dataLayers[this._dataLayers.length - 1].setVisible(!this._disableLayers);
    }
  }

  @Input() set layer(l: ILAYER) {
    this._currentLayer$.next(l);
  }

  ngOnChanges(c: SimpleChanges): void {
    if (c.map != null && c.map.currentValue != null) {
      this._map$.next(c.map.currentValue);
    }
    if (this.map != null && this.conf != null && this._mapIsInit$.value == false) {
      this._initLayer(this.conf);
      if (this.conf.start_end_icons_show === true && this.conf.start_end_icons_min_zoom != null) {
        this.map.on('moveend', e => {
          const view = this.map.getView();
          if (view != null) {
            const newZoom = +view.getZoom();
            const flagMinZoom = +this.conf.start_end_icons_min_zoom;
            if (newZoom >= flagMinZoom) {
              this._flagsLayer.setVisible(true);
            } else {
              this._flagsLayer.setVisible(false);
            }
          }
        });
      }
      setTimeout(() => {
        this._mapIsInit$.next(true);
      }, 400);
    }

    if (this.map != null && c.layer != null) {
      this._updateFlagsVisibilyByCurrentLayer();
    }

    if (this._dataLayers != null) {
      this._updateMap();
    }
    if (c.map && c.map.previousValue == null && c.map.currentValue != null) {
      this.layer = this._currentLayer$.value;
      if (this._disableLayers) {
        this.disableLayers = true;
      }
    }
  }

  private _getColorFromLayer(id: number): string {
    const layers = this.conf.layers || [];
    const layer = layers.filter(l => +l.id === +id);
    return layer[0] && layer[0].style && layer[0].style.color
      ? layer[0].style.color
      : this._defaultFeatureColor;
  }

  private _handlingStrokeStyleWidth(strokeStyle: StrokeStyle, conf: IMAP): void {
    const currentZoom: number = this.map.getView().getZoom();
    const minW = 1;
    const maxW = 8;
    const delta = (currentZoom - conf.minZoom) / (conf.maxZoom - conf.minZoom);
    const newWidth = minW + (maxW - minW) * delta;
    strokeStyle.setWidth(newWidth);
  }

  private async _initLayer(map: IMAP) {
    this._dataLayers = await this._initializeDataLayers(map);
    const interactions: Collection<Interaction> = this._initializeMapInteractions(this._dataLayers);
    interactions.getArray().forEach(interaction => {
      this.map.addInteraction(interaction);
    });
    this._selectInteraction.on('select', async (event: SelectEvent) => {
      const clickedFeature = event?.selected?.[0] ?? undefined;
      const clickedFeatureId: number = clickedFeature?.getProperties()?.id ?? undefined;
      if (clickedFeatureId > -1) {
        this.trackSelectedFromLayerEVT.emit(clickedFeatureId);
      }
    });
    if (map.start_end_icons_show && map.tracks) {
      map.tracks.forEach(track => {
        if (track.start != null && track.start.length === 2) {
          const startFeature = this._createFeature(startIconHtml, track.start);
          startFeature.setProperties({...track});
          this._flagFeatures.push(startFeature);
        }
        if (track.end != null && track.end.length === 2) {
          const endFeature = this._createFeature(endIconHtml, track.end);
          endFeature.setProperties({...track});
          this._flagFeatures.push(endFeature);
        }
      });
      this._flagsLayer = new VectorLayer({
        zIndex: 9400,
        source: new VectorSource({
          features: this._flagFeatures,
        }),
      });
      this._flagsLayer.setVisible(false);
      this.map.addLayer(this._flagsLayer);
      setTimeout(() => {
        this._updateFlagsVisibilyByCurrentLayer();
      }, 100);
    }
    if (this._disableLayers) {
      this.disableLayers = true;
    }

    this.map.updateSize();
  }

  /**
   * Initialize a specific layer with interactive data
   *
   * @returns the created layer
   */
  private async _initializeDataLayer(layerConfig: any, map: IMAP): Promise<VectorTileLayer> {
    if (!layerConfig.url) {
      return;
    }

    const layerJson = await this._communicationSvc.get(layerConfig.url).toPromise();

    if (!layerJson.tiles) {
      return;
    }

    const layer = new VectorTileLayer({
      declutter: true,
      source: new VectorTileSource({
        format: new MVT(),
        urls: layerJson.tiles,
      }),
      style: (feature: FeatureLike) => {
        const properties = feature.getProperties();
        const layers: number[] = JSON.parse(properties.layers);
        let strokeStyle: StrokeStyle = new StrokeStyle();
        let text = new Text({
          text: properties.ref != null && map.ref_on_track_show ? properties.ref : '',
          placement: 'line',
          offsetY: 20,
          rotateWithView: true,
          overflow: true,
          font: '12px "Roboto", "Arial Unicode MS", "sans-serif"',
          maxAngle: Math.PI / 16,
          textBaseline: 'hanging',
          fill: new Fill({
            color: this._defaultFeatureColor,
          }),
        });
        if (this._currentLayer$.value != null) {
          const currentIDLayer = +this._currentLayer$.value.id;
          if (layers.indexOf(currentIDLayer) >= 0) {
            strokeStyle.setColor(
              this._currentLayer$.value.style.color ?? this._defaultFeatureColor,
            );
          } else {
            strokeStyle.setColor('rgba(0,0,0,0)');
            text.setText('');
          }
        } else {
          const layerId = +layers[0];
          strokeStyle.setColor(this._getColorFromLayer(layerId));
        }
        this._handlingStrokeStyleWidth(strokeStyle, map);

        let style = new Style({
          stroke: strokeStyle,
          zIndex: TRACK_ZINDEX,
          text,
        });
        return style;
      },
      minZoom: 1,
      zIndex: TRACK_ZINDEX,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });
    return layer;
  }

  /**
   * Create the layers containing the map interactive data
   *
   * @returns the array of created layers
   */
  private async _initializeDataLayers(map: IMAP): Promise<Array<VectorTileLayer>> {
    const vectorLayerUrl = this._confSvc.vectorLayerUrl;
    const styleJson: any = styleJsonFn(vectorLayerUrl);

    const layers: Array<VectorTileLayer> = [];

    if (styleJson.sources) {
      this._styleJson = styleJson;
      for (const i in styleJson.sources) {
        layers.push(await this._initializeDataLayer(styleJson.sources[i], map));
        this.map.addLayer(layers[layers.length - 1]);
      }
    }

    return layers;
  }

  private _initializeMapInteractions(selectLayers: Array<Layer>): Collection<Interaction> {
    const interactions = defaultInteractions({
      doubleClickZoom: true,
      dragPan: true,
      mouseWheelZoom: true,
      pinchRotate: false,
      altShiftDragRotate: false,
    });
    this._selectInteraction = new SelectInteraction({
      layers: selectLayers,
      hitTolerance: 100,
      style: null,
    });

    interactions.push(this._selectInteraction);

    return interactions;
  }

  private _updateFlagsVisibilyByCurrentLayer(): void {
    this._flagFeatures.forEach(feature => {
      const properties = feature.getProperties();
      if (
        this._currentLayer$.value == null ||
        (properties != null &&
          properties.layers != null &&
          properties.layers.indexOf(this._currentLayer$.value.id) > -1 &&
          this._currentLayer$.value != null)
      ) {
        (feature.getStyle() as Style).getImage().setOpacity(1);
      } else {
        (feature.getStyle() as Style).getImage().setOpacity(0);
      }
    });
  }

  private _updateMap(): void {
    for (const layer of this._dataLayers) {
      layer.changed();
    }
  }
}
