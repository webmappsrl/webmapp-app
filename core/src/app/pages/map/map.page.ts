import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, NavController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import { DEF_MAP_LOCATION_ZOOM, DEF_MAP_MAX_BOUNDINGBOX, DEF_MAP_MAX_ZOOM } from 'src/app/constants/map';
import { GeohubService } from 'src/app/services/geohub.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { StatusService } from 'src/app/services/status.service';
import { EGeojsonGeometryTypes } from 'src/app/types/egeojson-geometry-types.enum';
import { ILocation } from 'src/app/types/location';
import { MapMoveEvent } from 'src/app/types/map';
import { IGeojsonCluster, IGeojsonClusterApiResponse, IGeojsonGeometry } from 'src/app/types/model';

@Component({
  selector: 'webmapp-page-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  @ViewChild('slider') slider: IonSlides;

  public clusters: IGeojsonCluster[];
  public _zoneAllClusters: IGeojsonCluster[];

  public boundigBox: number[];
  public actualZoom: number;

  public selectedTrack: IGeojsonGeometry;
  public referenceTrackId: number = null;

  public selectedTracks: CGeojsonLineStringFeature[] = [];

  public selectedTrackId: number = null;

  public sliderOptions = {
    slidesPerView: 1.2,
    centeredSlides: true
  };

  constructor(
    private _navController: NavController,
    private _geolocationService: GeolocationService,
    private _geohubService: GeohubService,
    private _statuService: StatusService
  ) { }

  ngOnInit() { }

  recordingClick(ev) {
    const location: ILocation = this._geolocationService.location;
    let state: any = {};

    if (location && location.latitude && location.longitude) {
      state = {
        startView: [
          location.longitude,
          location.latitude,
          DEF_MAP_LOCATION_ZOOM,
        ],
      };
    }
    this._navController.navigateForward('register', {
      state,
    });
  }

  isRecording() {
    return this._geolocationService.recording;
  }

  async mapMove(moveEvent: MapMoveEvent) {
    this.actualZoom = moveEvent.zoom;
    const res = await this._geohubService.search(moveEvent.boundigBox, this.referenceTrackId)
    if (res && res.features) {
      this.clusters = this._cleanResultsFromSelected(res);
    }
  }

  private _cleanResultsFromSelected(res: IGeojsonClusterApiResponse): IGeojsonCluster[] {
    let ret = res.features.filter(x => x.properties.ids[0] != this.selectedTrackId || x.properties.ids.length > 1);
    ret.forEach(cluster => {
      const ids = cluster.properties.ids;
      if (ids.includes(this.selectedTrackId)) {
        ids.splice(ids.indexOf(this.selectedTrackId), 1);
      }
    })
    return ret;
  }

  private _isMaxZoom() {
    return this.actualZoom == DEF_MAP_MAX_ZOOM;
  }

  async clickcluster(cluster: IGeojsonCluster) {
    //if (cluster.properties.ids.length > 1 && (!this._isMaxZoom() && !this.referenceTrackId)) {
      if (cluster.properties.ids.length > 1 && !this._isMaxZoom()) {
      //cluster
      this.boundigBox = cluster.properties.bbox;
      // this.selectTrack(null);
    } else {
      const trackId = cluster.properties.ids[0]
      if (!this.referenceTrackId) {
        this.referenceTrackId = trackId;

        // single track
        //const track = await this._geohubService.getEcTrack(trackId + '')
        this.selectedTracks = [];

        const allNearTrackClusters = await this._geohubService.search(DEF_MAP_MAX_BOUNDINGBOX, trackId)

        this._zoneAllClusters = []

        const ids = [], promises = [];
        allNearTrackClusters.features.forEach(clust => { ids.push(...clust.properties.ids) })
        ids.forEach(id => {
          promises.push(this._geohubService.getEcTrack(id + ''));
        })

        console.log("generate promises");
        const statusesPromise = Promise.all(promises);
        const ectracks = await statusesPromise;
        console.log("all promises");
        ectracks.forEach(ectrack => {
          this.selectedTracks.push(ectrack);
          this._zoneAllClusters.push(this._createClusterForEcTrack(ectrack))
        })

      }
      console.log("let's select");
      this.selectTrack(trackId);


    }
  }

  
  private _createClusterForEcTrack(ectrack: CGeojsonLineStringFeature): IGeojsonCluster {
    const simpleCluster: IGeojsonCluster = {
      type: 'Feature',
      geometry: {
        type: EGeojsonGeometryTypes.POINT,
        coordinates: [ectrack.geometry.coordinates[0][0], ectrack.geometry.coordinates[0][1]]
      },
      properties: {
        ids: [ectrack.properties.id],
        images: [ectrack.properties.feature_image.url],
        bbox: []
      }
    };
    return simpleCluster;
  }

  mapTouch(ev) {
    this.selectTrack(null);
  }

  closeCard() {
    this.selectTrack(null);
  }

  async selectTrack(id) {
    this.selectedTrackId = id;
    this._statuService.isSelectedMapTrack = !!id;
    this.selectedTracks = id ? this.selectedTracks : [];

    if (id) {
      // this.clusters = this._zoneAllClusters.filter(cl => cl.properties.ids[0] != id);

      const trackIdx = this._zoneAllClusters.findIndex(x => x.properties.ids[0] == id)
      this.selectedTrack = this.selectedTracks[trackIdx].geometry;
      const sliderIdx = await this.slider.getActiveIndex();
      if (sliderIdx != trackIdx) {
        setTimeout(() => {
          this.slider.slideTo(trackIdx);
        }, 0);
      }
    } else {
      this.selectedTrack = null;
      this.referenceTrackId = null;
    }
  }

  async sliderChange(ev) {
    const idx = await this.slider.getActiveIndex()
    const track = this.selectedTracks[idx];
    this.selectTrack(track.properties.id);
  }

  openTrack(track) {
    this.selectTrack(null);
    this._statuService.route = track;
    this._navController.navigateForward('route');
  }

}
