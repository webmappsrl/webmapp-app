import {Cluster, Vector as VectorSource} from 'ol/source';
import {Directive, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

import CircleStyle from 'ol/style/Circle';
import {Coordinate} from 'ol/coordinate';
import {CLUSTER_DISTANCE, DEF_MAP_CLUSTER_CLICK_TOLERANCE, ICN_PATH} from './constants';
import {FLAG_TRACK_ZINDEX} from './zIndex';
import Feature from 'ol/Feature';
import Fill from 'ol/style/Fill';
import {FitOptions} from 'ol/View';
import Geometry from 'ol/geom/Geometry';
import {IGeojsonFeature} from 'src/app/types/model';
import Icon from 'ol/style/Icon';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Point from 'ol/geom/Point';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import VectorLayer from 'ol/layer/Vector';
import {WmMapBaseDirective} from './base.directive';
import {buffer, createEmpty, extend} from 'ol/extent';
import {fromLonLat} from 'ol/proj';
import {IMAP} from 'src/app/types/config';
import {fromHEXToColor} from './utils';
import {
  clearLayer,
  clusterHullStyle,
  createCluster,
  createHull,
  createLayer,
  intersectionBetweenArrays,
  nearestFeatureOfCluster,
  selectCluster,
  setCurrentCluster,
} from 'src/app/shared/map-core/utils';
@Directive({
  selector: '[wmMapPois]',
})
export class WmMapPoisDirective extends WmMapBaseDirective implements OnChanges {
  private _firstPoiId: number;
  private _hullCluserLayer: VectorLayer<VectorSource>;
  private _poisClusterLayer: VectorLayer<Cluster>;
  private _selectedPoiLayer: VectorLayer<VectorSource>;

  @Input('poi') set setPoi(id: number) {
    if (this.map != null) {
      this._selectedPoiLayer = this._createLayer(this._selectedPoiLayer, FLAG_TRACK_ZINDEX + 100);
      this._selectedPoiLayer.getSource().clear();
      if (id > -1) {
        const currentPoi = this.pois.features.find(p => +p.properties.id === +id);
        if (currentPoi != null) {
          const icn = this._getIcnFromTaxonomies(currentPoi.properties.taxonomyIdentifiers);
          const coordinates = [
            currentPoi.geometry.coordinates[0] as number,
            currentPoi.geometry.coordinates[1] as number,
          ] || [0, 0];
          const position = fromLonLat([coordinates[0] as number, coordinates[1] as number]);
          const geometry = new Point([position[0], position[1]]);
          const iconFeature = new Feature({
            type: 'icon',
            geometry,
          });
          let iconStyle = new Style({
            image: new Icon({
              anchor: [0.5, 0.5],
              scale: 0.5,
              src: `${ICN_PATH}/${icn}.png`,
            }),
          });
          if (
            currentPoi != null &&
            currentPoi.properties != null &&
            currentPoi.properties.svgIcon != null
          ) {
            const properties = currentPoi.properties || null;
            const taxonomy = properties.taxonomy || null;
            const poyType = taxonomy.poi_type || null;
            const poiColor = poyType.color
              ? poyType.color
              : properties.color
              ? properties.color
              : '#ff8c00';
            const namedPoiColor = fromHEXToColor[poiColor] || 'darkorange';
            iconStyle = new Style({
              image: new Icon({
                anchor: [0.5, 0.5],
                scale: 1,
                src: `data:image/svg+xml;utf8,${currentPoi.properties.svgIcon
                  .replaceAll('<circle fill="darkorange"', '<circle fill="white" ')
                  .replaceAll(`<g fill="white"`, `<g fill="${namedPoiColor || 'darkorange'}" `)}`,
              }),
            });
          }
          iconFeature.setStyle(iconStyle);
          iconFeature.setId(currentPoi.properties.id);
          const source = this._selectedPoiLayer.getSource();
          source.addFeature(iconFeature);
          source.changed();
          this._fitView(geometry as any);
        }
      }
    }
  }

  @Input() WmMapPoisUnselectPoi: boolean;
  @Input() conf: IMAP;
  @Input() filters: any[] = [];
  @Input() pois: any;
  @Output() currentPoiEvt: EventEmitter<any> = new EventEmitter<any>();
  @Output('poi-click') poiClick: EventEmitter<number> = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.map != null &&
      changes.map.currentValue != null &&
      changes.map.previousValue == null
    ) {
      this.map.on('click', event => {
        if (this._selectedPoiLayer == null) {
          this._selectedPoiLayer = createLayer(this._selectedPoiLayer, FLAG_TRACK_ZINDEX + 100);
          this.map.addLayer(this._selectedPoiLayer);
        }
        this._selectedPoiLayer.getSource().clear();
        try {
          if (this.map.getView().getZoom() === this.map.getView().getMaxZoom()) {
            selectCluster.setActive(true);
          } else {
            selectCluster.setActive(false);
          }
          this._poisClusterLayer.getFeatures(event.pixel).then(features => {
            if (features.length > 0) {
              setCurrentCluster(features[0]);
              const clusterMembers = features[0].get('features');
              this._hullCluserLayer.setStyle(clusterHullStyle);
              if (clusterMembers.length > 1) {
                // Calculate the extent of the cluster members.
                const extent = createEmpty();
                clusterMembers.forEach(feature =>
                  extend(extent, feature.getGeometry().getExtent()),
                );
                const view = this.map.getView();
                setTimeout(() => {
                  if (view.getZoom() === view.getMaxZoom()) {
                    selectCluster.setActive(true);
                  }
                  // Zoom to the extent of the cluster members.
                  view.fit(extent, {duration: 500, padding: [50, 50, 50, 50]});
                  setTimeout(() => {
                    if (view.getZoom() === view.getMaxZoom()) {
                      selectCluster.setActive(true);
                    }
                  }, 200);
                }, 400);
              } else {
                selectCluster.setActive(true);
                const poiFeature = nearestFeatureOfCluster(this._poisClusterLayer, event, this.map);

                if (poiFeature) {
                  const poi = poiFeature.getProperties();
                  this.currentPoiEvt.emit(poi);
                  this._selectIcon(poi);
                  this._fitView(poi.geometry);
                }
              }
            }
          });
          setTimeout(() => {
            this._activateInteractions();
          }, 1200);
        } catch (e) {
          console.log(e);
        }
      });
    }
    if (
      changes &&
      ((changes.filters != null && changes.filters.firstChange === false) ||
        changes.WmMapPoisUnselectPoi != null)
    ) {
      clearLayer(this._selectedPoiLayer);
    }

    if (this.map != null && this.pois != null) {
      if (this.filters.length > 0) {
        if (this._poisClusterLayer != null) {
          this._poisClusterLayer.getSource().clear();
          (this._poisClusterLayer.getSource() as any).getSource().clear();
        }
        const selectedFeatures = this.pois.features.filter(
          p => this._intersection(p.properties.taxonomyIdentifiers, this.filters).length > 0,
        );
        this._addPoisFeature(selectedFeatures);
      } else {
        this._addPoisFeature(this.pois.features);
      }
      selectCluster.getFeatures().on(['add'], e => {
        var c = e.element.get('features');

        if (c.length === 1 && this.map.getView().getZoom() === this.map.getView().getMaxZoom()) {
          this.currentPoiEvt.emit(c[0].getProperties());
          this._selectedPoiLayer.getSource().clear();
        }
      });
    }
    if (
      changes.map != null &&
      changes.map.currentValue != null &&
      changes.map.previousValue == null
    ) {
      if (this._firstPoiId != null) {
        this.setPoi = this._firstPoiId;
      }
    }
  }

  private _activateInteractions(): void {
    this.map.getInteractions().forEach(i => i.setActive(true));
  }

  private _addPoisFeature(poiCollection: IGeojsonFeature[]) {
    if (this._poisClusterLayer == null) {
      this._poisClusterLayer = createCluster(this._poisClusterLayer, FLAG_TRACK_ZINDEX);
      this.map.addLayer(this._poisClusterLayer);
      createHull(this.map);
    }
    const clusterSource: any = this._poisClusterLayer.getSource() as Cluster;
    const featureSource = clusterSource.getSource();
    this._hullCluserLayer = new VectorLayer({
      style: clusterHullStyle,
      source: clusterSource,
    });
    this.map.addLayer(this._hullCluserLayer);
    if (poiCollection) {
      for (const poi of poiCollection) {
        const properties = poi.properties || null;
        const taxonomy = properties.taxonomy || null;
        const poyType = taxonomy.poi_type || null;
        const icn = this._getIcnFromTaxonomies(properties.taxonomyIdentifiers);
        const coordinates = [
          poi.geometry.coordinates[0] as number,
          poi.geometry.coordinates[1] as number,
        ] || [0, 0];

        const poiColor = poyType.color
          ? poyType.color
          : properties.color
          ? properties.color
          : '#ff8c00';
        const namedPoiColor = fromHEXToColor[poiColor] || 'darkorange';
        const position = fromLonLat([coordinates[0] as number, coordinates[1] as number]);
        const iconFeature = new Feature({
          type: 'icon',
          geometry: new Point([position[0], position[1]]),
          properties: {
            ...properties,
            ...{color: poiColor},
            ...{taxonomyIdentifiers: properties.taxonomyIdentifiers},
          },
        });
        let iconStyle = new Style({
          image: new Icon({
            anchor: [0.5, 0.5],
            scale: 0.5,
            src: `${ICN_PATH}/${icn}.png`,
          }),
        });
        if (poi != null && poi.properties != null && poi.properties.svgIcon != null) {
          const src = `data:image/svg+xml;utf8,${poi.properties.svgIcon.replaceAll(
            'darkorange',
            namedPoiColor,
          )}`;
          iconStyle = new Style({
            image: new Icon({
              anchor: [0.5, 0.5],
              scale: 1,
              src,
            }),
          });
        }

        iconFeature.setStyle(iconStyle);
        iconFeature.setId(poi.properties.id);
        featureSource.addFeature(iconFeature);
        featureSource.changed();
        clusterSource.changed();
      }
    }

    this.map.on('moveend', e => {
      const view = this.map.getView();
      if (view != null) {
        const newZoom = +view.getZoom();
        const poisMinZoom = +this.conf.pois.poiMinZoom || 15;
        if (newZoom >= poisMinZoom) {
          this._poisClusterLayer.setVisible(true);
        } else {
          this._poisClusterLayer.setVisible(false);
        }
      }
    });
  }

  private _createCluster(clusterLayer: VectorLayer<Cluster>, zIndex: number) {
    if (!clusterLayer) {
      clusterLayer = new VectorLayer({
        source: new Cluster({
          distance: CLUSTER_DISTANCE,
          source: new VectorSource({
            features: [],
          }),
          geometryFunction: (feature: Feature): Point | null => {
            return feature.getGeometry().getType() === 'Point'
              ? <Point>feature.getGeometry()
              : null;
          },
        }),
        style: function (feature) {
          const size = feature.get('features').length;
          let style = styleCache[size];
          if (size === 1) {
            const icon = feature.getProperties().features[0];
            return icon.getStyle() || null;
          }
          if (!style) {
            style = new Style({
              image: new CircleStyle({
                radius: 15,
                stroke: new Stroke({
                  color: '#fff',
                }),
                fill: new Fill({
                  color: '#3399CC',
                }),
              }),
              text: new Text({
                text: `${size}`,
                scale: 1.5,
                fill: new Fill({
                  color: '#fff',
                }),
                font: '30px ',
              }),
            });
            styleCache[size] = style;
          }
          return style;
        },
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex,
      });

      this.map.addLayer(clusterLayer);

      const styleCache = {};
    }
    return clusterLayer;
  }

  private _createLayer(layer: VectorLayer<VectorSource>, zIndex: number) {
    if (!layer) {
      layer = new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex,
      });
      this.map.addLayer(layer);
    }
    return layer;
  }

  private _deactivateInteractions(): void {
    this.map.getInteractions().forEach(i => i.setActive(false));
  }

  private _distance(c1: Coordinate, c2: Coordinate) {
    return Math.sqrt(Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2));
  }

  private _fitView(geometryOrExtent: any, optOptions?: FitOptions): void {
    if (optOptions == null) {
      optOptions = {
        maxZoom: this.map.getView().getMaxZoom() - 1,
        duration: 1000,
        padding: [0, 0, 250, 0],
      };
    }
    this.map.getView().fit(geometryOrExtent, optOptions);
  }

  private _getIcnFromTaxonomies(taxonomyIdentifiers: string[]): string {
    const excludedIcn = ['theme_ucvs'];
    const res = taxonomyIdentifiers.filter(
      p => excludedIcn.indexOf(p) === -1 && p.indexOf('poi_type') > -1,
    );
    return res.length > 0 ? res[0] : taxonomyIdentifiers[0];
  }

  private _getNearest(features: Feature<Geometry>[], coordinate: Coordinate) {
    let ret: Feature<Geometry> = features[0];
    let minDistance = Number.MAX_VALUE;
    features.forEach(feature => {
      const geom = feature.getGeometry() as Point;
      const distance = this._distance(geom.getFlatCoordinates(), coordinate);
      if (distance < minDistance) {
        minDistance = distance;
        ret = feature;
      }
    });
    return ret;
  }

  private _getNearestFeatureOfCluster(
    layer: VectorLayer<VectorSource>,
    evt: MapBrowserEvent<UIEvent>,
  ): Feature<Geometry> {
    const precision = this.map.getView().getResolution() * DEF_MAP_CLUSTER_CLICK_TOLERANCE;
    let nearestFeature = null;
    const features: Feature<Geometry>[] = [];
    const clusterSource = layer.getSource() as any;
    const layerSource = clusterSource.getSource();

    if (layer && layerSource) {
      layerSource.forEachFeatureInExtent(
        buffer(
          [evt.coordinate[0], evt.coordinate[1], evt.coordinate[0], evt.coordinate[1]],
          precision,
        ),
        feature => {
          features.push(feature);
        },
      );
    }

    if (features.length) {
      nearestFeature = this._getNearest(features, evt.coordinate);
    }

    return nearestFeature;
  }

  private _initDirective(): void {
    if (this._firstPoiId != null) {
      this.setPoi = this._firstPoiId;
    }
    this.map.on('click', event => {
      if (this._selectedPoiLayer == null) {
        this._selectedPoiLayer = createLayer(this._selectedPoiLayer, FLAG_TRACK_ZINDEX + 100);
        this.map.addLayer(this._selectedPoiLayer);
      }
      this._selectedPoiLayer.getSource().clear();
      try {
        if (this.map.getView().getZoom() === this.map.getView().getMaxZoom()) {
          selectCluster.setActive(true);
        } else {
          selectCluster.setActive(false);
        }
        this._poisClusterLayer.getFeatures(event.pixel).then(features => {
          if (features.length > 0) {
            setCurrentCluster(features[0]);
            const clusterMembers = features[0].get('features');
            this._hullCluserLayer.setStyle(clusterHullStyle);
            if (clusterMembers.length > 1) {
              // Calculate the extent of the cluster members.
              const extent = createEmpty();
              clusterMembers.forEach(feature => extend(extent, feature.getGeometry().getExtent()));
              const view = this.map.getView();
              setTimeout(() => {
                if (view.getZoom() === view.getMaxZoom()) {
                  selectCluster.setActive(true);
                }
                // Zoom to the extent of the cluster members.
                view.fit(extent, {duration: 500, padding: [50, 50, 50, 50]});
                setTimeout(() => {
                  if (view.getZoom() === view.getMaxZoom()) {
                    selectCluster.setActive(true);
                  }
                }, 200);
              }, 400);
            } else {
              selectCluster.setActive(true);
              const poiFeature = nearestFeatureOfCluster(this._poisClusterLayer, event, this.map);

              if (poiFeature) {
                const poi = poiFeature.getProperties();
                this.currentPoiEvt.emit(poi);
                this._selectIcon(poi);
                this._fitView(poi.geometry);
              }
            }
          }
        });
        setTimeout(() => {
          this._activateInteractions();
        }, 1200);
      } catch (e) {
        console.log(e);
      }
    });
  }

  private _intersection(a: any[], b: any[]): any[] {
    var setA = new Set(a);
    var setB = new Set(b);
    var intersection = new Set([...setA].filter(x => setB.has(x)));
    return Array.from(intersection);
  }

  private _isCluster(layer: VectorLayer<Cluster>, evt: MapBrowserEvent<UIEvent>): boolean {
    const precision = this.map.getView().getResolution() * DEF_MAP_CLUSTER_CLICK_TOLERANCE;
    const features: Feature<Geometry>[] = [];
    const clusterSource = layer.getSource() as any;
    const layerSource = clusterSource.getSource();

    if (layer && layerSource) {
      layerSource.forEachFeatureInExtent(
        buffer(
          [evt.coordinate[0], evt.coordinate[1], evt.coordinate[0], evt.coordinate[1]],
          precision,
        ),
        feature => {
          features.push(feature);
        },
      );
    }

    return features.length > 1;
  }

  private _selectIcon(currentPoi): void {
    if (currentPoi != null) {
      const icn = this._getIcnFromTaxonomies(currentPoi.properties.taxonomyIdentifiers);
      let geometry = null;
      if (currentPoi.geometry.coordinates != null) {
        const coordinates = [
          currentPoi.geometry.coordinates[0] as number,
          currentPoi.geometry.coordinates[1] as number,
        ] || [0, 0];
        const position = fromLonLat([coordinates[0] as number, coordinates[1] as number]);
        geometry = new Point([position[0], position[1]]);
      } else {
        geometry = currentPoi.geometry;
      }
      const iconFeature = new Feature({
        type: 'icon',
        geometry,
      });
      let iconStyle = new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          scale: 0.5,
          src: `${ICN_PATH}/${icn}_selected.png`,
        }),
      });
      if (
        currentPoi != null &&
        currentPoi.properties != null &&
        currentPoi.properties.svgIcon != null
      ) {
        const properties = currentPoi.properties || null;
        const taxonomy = properties.taxonomy || null;
        const poyType = taxonomy.poi_type || null;
        const poiColor = poyType.color
          ? poyType.color
          : properties.color
          ? properties.color
          : '#ff8c00';
        const namedPoiColor = fromHEXToColor[poiColor] || 'darkorange';
        iconStyle = new Style({
          image: new Icon({
            anchor: [0.5, 0.5],
            scale: 1,
            src: `data:image/svg+xml;utf8,${currentPoi.properties.svgIcon
              .replaceAll(`<circle fill="${'darkorange'}"`, '<circle fill="white" ')
              .replaceAll(`<g fill="white"`, `<g fill="${namedPoiColor || 'darkorange'}" `)}`,
          }),
        });
      }
      iconFeature.setStyle(iconStyle);
      iconFeature.setId(currentPoi.properties.id);
      console.log(`const source = this._selectedPoiLayer.getSource();`);
      const source = this._selectedPoiLayer.getSource();
      source.addFeature(iconFeature);
      source.changed();

      this._fitView(geometry as any);
      this.currentPoiEvt.emit(currentPoi);
    }
  }
}
