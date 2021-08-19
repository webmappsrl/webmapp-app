import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, NavController } from '@ionic/angular';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import { DEF_MAP_LOCATION_ZOOM } from 'src/app/constants/map';
import { GeohubService } from 'src/app/services/geohub.service';
import { GeolocationService } from 'src/app/services/geolocation.service';
import { StatusService } from 'src/app/services/status.service';
import { EGeojsonGeometryTypes } from 'src/app/types/egeojson-geometry-types.enum';
import { ILocation } from 'src/app/types/location';
import { IGeojsonCluster, IGeojsonGeometry } from 'src/app/types/model';

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

  public selectedTrack: IGeojsonGeometry;

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

  async mapMove(moveEv) {
    const res = await this._geohubService.search(moveEv)
    if (res && res.features && !this.selectedTrackId) {
      this.clusters = res.features.filter(x => { return (x.properties.ids[0] != this.selectedTrackId) || !this.selectedTrackId });
    }
  }

  async clickcluster(cluster: IGeojsonCluster) {
    if (cluster.properties.ids.length > 1) {
      //cluster
      this.boundigBox = cluster.properties.bbox;
      this.selectTrack(null);
    } else {
      const trackId = cluster.properties.ids[0]
      if (this.selectedTrackId) {
        this.selectTrack(trackId);
      } else {
        // single track
        //const track = await this._geohubService.getEcTrack(trackId + '')
        this.selectedTracks = [];

        const clusterCopy = this.clusters;
        //this.clusters = [];
        this._zoneAllClusters = []
        let trackIdx = 0, idx = 0;
        for (let clust of clusterCopy) {
          for (let id of clust.properties.ids) {
            const ectrack = await this._geohubService.getEcTrack(id + '');
            this.selectedTracks.push(ectrack);
            if (trackId === id) {
              trackIdx = idx;
            }
            idx++;

            this._zoneAllClusters.push(this._createClusterForEcTrack(ectrack))
          }
        }

        this.selectTrack(trackId);

      }

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
        images: [ectrack.properties.image.url],
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
      this.clusters = this._zoneAllClusters.filter(cl => cl.properties.ids[0] != id);

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
