import {
  IGeojsonClusterApiResponse,
  IGeojsonFeature,
  IGeojsonPoi,
  IGeojsonPoiDetailed,
  WhereTaxonomy,
} from '../types/model';

import {CGeojsonLineStringFeature} from '../classes/features/cgeojson-line-string-feature';
import {CommunicationService} from './base/communication.service';
import {ConfigService} from './config.service';
import {EGeojsonGeometryTypes} from '../types/egeojson-geometry-types.enum';
import {HttpHeaders} from '@angular/common/http';
import {ILocation} from '../types/location';
import {IPhotoItem} from './photo.service';
import {ITrack} from '../types/track';
import {Injectable} from '@angular/core';
import {SearchStringResult} from '../types/map';
import {StorageService} from './base/storage.service';
import {TAXONOMYWHERE_STORAGE_KEY} from '../constants/storage';
import {WaypointSave} from '../types/waypoint';
import {environment} from 'src/environments/environment';
import {map} from 'rxjs/operators';
import {of} from 'rxjs';

const FAVOURITE_PAGESIZE = 3;

@Injectable({
  providedIn: 'root',
})
export class GeohubService {
  private _ecTracks: Array<CGeojsonLineStringFeature>;
  private _favourites: Array<number> = null;

  constructor(
    private _communicationService: CommunicationService,
    private _storageService: StorageService,
    private _configService: ConfigService,
  ) {
    this._ecTracks = [];
  }

  async favourites(): Promise<number[]> {
    if (!this._favourites) {
      try {
        const {favorites} = await this._communicationService
          .get(`${environment.api}/api/ec/track/favorite/list`)
          .toPromise();
        this._favourites = favorites;
      } catch (err) {
        console.log('------- ~ GeohubService ~ favourites ~ err', err);
      }
    }
    return this._favourites;
  }

  async getDetailsPoisForTrack(id: number): Promise<Array<IGeojsonPoiDetailed>> {
    const mock = {
      type: 'FeatureCollection',
      features: [
        {
          properties: {
            id: 1,
            image:
              'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/83_150x150.jpg',
            images: ['https://picsum.photos/250/150', 'https://picsum.photos/250/150'],
            name: {it: 'esempio', en: 'example'},
            description: {it: 'descrizione poi', en: 'desc'},
            email: 'pippo@gmail.com',
            phone: '12345678',
            address: 'Via di qua 0',
            url: 'http://www.google.com',
          },
          geometry: {
            type: 'Point',
            coordinates: [11.1022, 42.66137],
          },
        },
        {
          properties: {
            id: 2,
            image:
              'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/107_150x150.jpg',
            images: [
              'https://picsum.photos/250/150',
              'https://picsum.photos/250/150',
              'https://picsum.photos/250/150',
              'https://picsum.photos/250/150',
            ],
            name: {it: 'esempio 2 ', en: 'example'},
            description: {
              it: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce consectetur dapibus risus et euismod. Curabitur vel elit arcu. Vestibulum vehicula porttitor lacus, et sodales lorem vehicula vel. Quisque commodo mi id faucibus mollis. Nam porttitor, enim nec consequat commodo, dui lacus suscipit ante, in scelerisque lectus nibh eu turpis. Nulla metus risus, tristique vitae cursus vitae, hendrerit quis dolor. Donec tincidunt quis nulla sed lobortis. Aliquam eget nunc fringilla, fermentum sem ac, condimentum neque. Phasellus id aliquet sem, nec facilisis orci. Maecenas ultricies sollicitudin auctor. Cras quis orci placerat neque viverra tempor. Mauris et dolor rutrum, rutrum elit a, consectetur sem. Sed a erat nunc. Aliquam suscipit tincidunt semper. Morbi maximus eros diam.
                        Praesent dapibus, turpis in pulvinar efficitur, justo elit pulvinar lectus, non varius quam massa et sapien. Integer pulvinar diam lacus, in aliquam massa efficitur at. Suspendisse interdum auctor erat et lobortis. Sed a quam nunc. Mauris vitae erat placerat, interdum magna ac, accumsan urna. Suspendisse eu suscipit dolor. In hac habitasse platea dictumst. Cras volutpat risus a magna scelerisque, sed facilisis leo ullamcorper. In placerat ante a metus molestie euismod. Nulla ante sem, sollicitudin at dolor vel, fermentum ornare erat. Quisque posuere vitae risus ac porta. Nullam dapibus tincidunt quam non dictum. Vestibulum scelerisque nunc et lectus ornare, vitae mattis ante dictum. Aliquam erat volutpat. Praesent congue lacus mi, sed consequat nibh dapibus vel. Suspendisse potenti.
                        Cras gravida eros felis, sit amet commodo odio convallis id. In mi eros, pretium sed magna a, rutrum pretium neque. Suspendisse feugiat aliquet nunc non venenatis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum pellentesque dictum dictum. Aenean ultrices consectetur congue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce ullamcorper nisl dolor, a dapibus magna fermentum vel. Donec a maximus lectus. Donec posuere hendrerit enim placerat imperdiet. Aliquam commodo est lacus, at lacinia erat volutpat ac. Quisque in nisl aliquam, lobortis ante at, aliquam diam. Sed eu sagittis arcu. Nulla facilisi. Nam egestas sem tellus, eu ultricies neque ultrices sit amet.
                        Morbi efficitur magna a vestibulum auctor. Praesent pellentesque risus ac urna scelerisque, non consequat justo commodo. Curabitur viverra lacus non magna tristique consectetur quis eu dolor. Etiam consectetur ornare nibh eget tempor. Fusce pulvinar, lacus eget dictum finibus, tortor elit finibus libero, ac convallis est enim nec risus. Duis faucibus, urna ac placerat blandit, justo tortor mattis arcu, in euismod arcu neque ac turpis. Duis sodales massa vel laoreet tempor. Suspendisse fringilla neque ut ante aliquet, vel rhoncus erat semper. Donec ut lacinia lorem, sed porta massa. Suspendisse quis nisi at lorem accumsan ornare. Duis tristique metus at sapien viverra ullamcorper. Curabitur venenatis justo nibh, sed venenatis nulla elementum eu. Nullam vulputate urna maximus vestibulum suscipit. Phasellus semper lacus vitae lacinia convallis. Cras tempus nec lorem vitae faucibus.
                        Pellentesque ac nibh eros. Pellentesque tempus consectetur metus, eu euismod augue. Aenean a facilisis felis. Suspendisse potenti. Proin venenatis, nunc a dictum fermentum, nibh augue dignissim lacus, ut congue dui ante ut est. Mauris cursus faucibus eros, ut euismod urna. Duis ut tempor nulla. Nunc facilisis semper diam vitae aliquam. Pellentesque non imperdiet odio. Donec accumsan viverra metus eu sollicitudin. In elit neque, tristique in turpis et, rutrum gravida mi.`,
              en: 'desc',
            },
          },
          geometry: {
            type: 'Point',
            coordinates: [11.108, 42.658],
          },
        },
      ],
    };
    let call = this._communicationService.get(
      `${environment.api}/api/ec/track/get_related_simple/${id}`,
    );
    call = of(mock);
    const res = await call.pipe(map(x => x.features)).toPromise();
    return res;
  }

  /**
   * Get an instance of the specified ec media
   *
   * @param {string} id the ec media id
   *
   * @returns {IGeojsonFeature}
   */
  async getEcMedia(id: string): Promise<IGeojsonFeature> {
    return undefined;
  }

  /**
   * Get an instance of the specified ec poi
   *
   * @param {string} id the ec poi id
   *
   * @returns {IGeojsonFeature}
   */
  getEcPoi(id: string): IGeojsonFeature {
    return undefined;
  }

  /**
   * Get an instance of the specified ec track
   *
   * @param id the ec track id
   *
   * @returns
   */
  async getEcTrack(id: string | number): Promise<CGeojsonLineStringFeature> {
    if (id == null) return null;
    const cacheResult: CGeojsonLineStringFeature = this._ecTracks.find(
      (ecTrack: CGeojsonLineStringFeature) => ecTrack?.properties?.id === id,
    );
    if (cacheResult) {
      return cacheResult;
    }
    if (id > -1) {
      const result = await this._communicationService
        .get(`${environment.api}/api/ec/track/${id}`)
        .pipe(
          map((apiResult: CGeojsonLineStringFeature) => {
            return apiResult;
          }),
        )
        .toPromise();

      this._ecTracks.push(result);
      if (this._ecTracks.length > 10) {
        this._ecTracks.splice(0, 1);
      }

      return result;
    }
  }

  /**
   * Get an instance of the specified ec track
   *
   * @param {string} id the ec track id
   *
   * @returns {CGeojsonLineStringFeature}
   */
  async getEcTrackAPP(id: string | number): Promise<CGeojsonLineStringFeature> {
    const fondo = ['asfalto', 'lastricato', 'naturale'];
    const res = await this._communicationService
      .get(`${environment.api}/api/ec/track/${id}`)
      .pipe(
        map((res: CGeojsonLineStringFeature) => {
          let lastAlt = 0;
          let idx = 0;
          res.geometry.coordinates.forEach(coord => {
            coord.push(Math.abs(coord[2] - lastAlt)); //pendenza
            lastAlt = coord[2];
            coord.push(fondo[Math.round(idx / 30) % 3]);
            idx++;
          });
          res.properties.praticability = [
            {
              name: {it: 'Trekking'},
              icon: 'trekking',
            },
            {
              name: {it: 'A cavallo'},
              icon: 'horse',
            },
            {
              name: {it: 'In bici'},
              icon: 'bike',
            },
          ];
          return res;
        }),
      )
      .toPromise();
    return res;
  }

  async getFavouriteTracks(page: number = 0): Promise<Array<IGeojsonFeature>> {
    const favourites = await this.favourites();

    let ids: number[] = [];
    if (favourites) {
      ids = favourites.slice(page * FAVOURITE_PAGESIZE, (page + 1) * FAVOURITE_PAGESIZE);
    }

    return this.getTracks(ids);
  }

  /**
   * Get an array with the closest ec tracks to the specified location
   *
   * @returns {Array<IGeojsonFeature>}
   */
  async getMostViewedEcTracks(): Promise<Array<IGeojsonFeature>> {
    const res = await this._communicationService
      .get(`${environment.api}/api/ec/track/most_viewed?app_id=${this._configService.appId}`)
      .pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  /**
   * Get an array with the closest ec tracks to the specified location
   *
   * @param {ILocation} location the reference location
   *
   * @returns {Array<IGeojsonFeature>}
   */
  async getNearEcTracks(location: ILocation): Promise<Array<IGeojsonFeature>> {
    const res = await this._communicationService
      .get(
        `${environment.api}/api/ec/track/nearest/${location.longitude}/${location.latitude}?app_id=${this._configService.appId}`,
      )
      .pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  async getPoiForTrack(id: number): Promise<Array<IGeojsonPoi>> {
    const mock = {
      type: 'FeatureCollection',
      features: [
        {
          properties: {
            id: 1,
            image:
              'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/83_150x150.jpg',
          },
          geometry: {
            type: 'Point',
            coordinates: [11.1022, 42.66137],
          },
        },
        {
          properties: {
            id: 2,
            image:
              'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/107_150x150.jpg',
          },
          geometry: {
            type: 'Point',
            coordinates: [11.108, 42.658],
          },
        },
      ],
    };
    let call = this._communicationService.get(
      `${environment.api}/api/ec/track/get_related_simple/${id}`,
    );
    call = of(mock);
    const res = await call.pipe(map(x => x.features)).toPromise();
    return res;
  }

  async getTracks(ids: number[]): Promise<Array<IGeojsonFeature>> {
    const res = await this._communicationService
      .get(`${environment.api}/api/ec/track/multiple?ids=${ids.join(',')}`)
      .pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  async getUgcTracks() {
    return await this._communicationService
      .get(
        `${environment.api}/api/ugc/track/index`,
        new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      )
      .toPromise();
  }

  /**
   * Get a where taxonomy (form cache if available)
   *
   * @param id id of the where taxonomy
   * @returns a where taxonomy
   */
  async getWhereTaxonomy(id: string): Promise<WhereTaxonomy> {
    const cacheId = `${TAXONOMYWHERE_STORAGE_KEY}-${id}`;
    const cached = await this._getFromCache(cacheId);
    if (cached) return cached;
    const res = await this._communicationService
      .get(`${environment.api}/api/taxonomy/where/${id}`)
      .pipe(
        map(value => {
          delete value.geometry;
          this._setInCache(cacheId, value);
          return value;
        }),
      )
      .toPromise();
    return res;
  }

  async isFavouriteTrack(trackId: number): Promise<boolean> {
    const favourites = await this.favourites();
    if (favourites && favourites.length) {
      return !!favourites.find(x => x == trackId);
    }
    return false;
  }

  /**
   * Save a photo as a EC MEDIA to the Geohub
   *
   * @param photo the photo to save
   *
   * @returns
   */
  async savePhoto(photo: IPhotoItem) {
    console.log('save photo to geohub', photo);
    const geojson = {
      type: 'Feature',
      geometry: photo.position
        ? {
            type: EGeojsonGeometryTypes.POINT,
            coordinates: [photo.position.longitude, photo.position.latitude],
          }
        : null,
      properties: {
        description: photo.description,
        name: photo.description,
        app_id: this._configService.appId,
        position: photo?.position,
      },
    };

    const data = new FormData();

    if (photo.blob) data.append('image', photo.blob, 'image.jpg');
    data.append('geojson', JSON.stringify(geojson));
    console.log('------- ~ GeohubService ~ savePhoto ~ data', data);

    // The content type multipart/form-data is not set because there could be problems
    // Read this https://stackoverflow.com/questions/35722093/send-multipart-form-data-files-with-angular-using-http
    const res = await this._communicationService
      .post(`${environment.api}/api/ugc/media/store`, data)
      .toPromise();
    return res;
  }

  /**
   * Save a track as a EC TRACK to the Geohub
   *
   * @param track the track to save
   *
   * @returns
   */
  async saveTrack(track: ITrack) {
    const geometry = JSON.parse(JSON.stringify(track.geojson.geometry));
    geometry.coordinates = geometry.coordinates.map((x: any) => {
      return [x[0], x[1]];
    });
    const propeties = {...track};
    delete propeties.geojson;
    const data = {
      type: 'Feature',
      geometry: geometry,
      properties: {
        ...{
          name: track.title,
          description: track.description,
          app_id: this._configService.appId,
          image_gallery: track.photoKeys ? track.photoKeys : [],
        },
        ...propeties,
      },
    };
    const res = await this._communicationService
      .post(
        `${environment.api}/api/ugc/track/store`,
        data,
        new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      )
      .toPromise();
    return res;
  }

  /**
   * Save a waypoint as a EC POI to the Geohub
   *
   * @param waypoint the waypoint to save
   *
   * @returns
   */
  async saveWaypoint(waypoint: WaypointSave) {
    const data = {
      type: 'Feature',
      geometry: {
        type: EGeojsonGeometryTypes.POINT,
        coordinates: [waypoint.position.longitude, waypoint.position.latitude],
      },
      properties: {
        name: waypoint.title,
        description: waypoint.description,
        app_id: this._configService.appId,
        image_gallery: waypoint.photoKeys ? waypoint.photoKeys : [],
        waypoint_type: waypoint.waypointtype,
        ...waypoint,
      },
    };
    const res = await this._communicationService
      .post(`${environment.api}/api/ugc/poi/store`, data, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .toPromise();
    return res;
  }

  /**
   * Perform a search with the given params
   *
   * @returns {Array<RouteCluster>}
   */
  async search(
    boundingbox: number[],
    filters,
    referenceTrackId: number,
  ): Promise<IGeojsonClusterApiResponse> {
    let url = `${environment.api}/api/ec/track/search?bbox=${boundingbox[0]},${boundingbox[1]},${boundingbox[2]},${boundingbox[3]}&app_id=${this._configService.appId}`;
    if (referenceTrackId) {
      url += `&reference_id=${referenceTrackId}`;
    }
    const res = await this._communicationService.get(url).toPromise();
    return res;
  }

  async setFavouriteTrack(trackId: number, isFavourite: boolean): Promise<boolean> {
    if (isFavourite) {
      await this._communicationService
        .post(
          `${environment.api}/api/ec/track/favorite/add/${trackId}`,
          null,
          new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        )
        .toPromise();
    } else {
      await this._communicationService
        .post(
          `${environment.api}/api/ec/track/favorite/remove/${trackId}`,
          null,
          new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        )
        .toPromise();
    }

    const favourites = await this.favourites();
    let idx = -1;
    if (favourites && favourites.length) {
      idx = favourites.findIndex(x => x === trackId);
    }
    if (isFavourite) {
      if (idx < 0) {
        favourites.push(trackId);
      }
    } else {
      if (idx >= 0) {
        favourites.splice(idx, 1);
      }
    }
    return isFavourite;
  }

  public async stringSearch(searchstring: string): Promise<SearchStringResult> {
    //TODO real mock and result type
    const mock: SearchStringResult = {
      places: [
        {
          id: 1,
          name: {it: 'esempio 2 ', en: 'example'},
          bbox: [11.1022, 42.66137, 11.108, 42.658],
        },
        {
          id: 2,
          name: {it: `Lorem ipsum dolor sit amet, `, en: 'desc'},
          bbox: [11.1022, 42.66137, 11.108, 42.658],
        },
      ],
      ec_tracks: [
        {
          id: 22,
          image:
            'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/107_150x150.jpg',
          name: {it: 'esempio traccia ', en: 'example'},
          where: [1],
        },
        {
          id: 25,
          image:
            'https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/83_150x150.jpg',
          name: {it: 'esempio traccia bis  ', en: 'example'},
          where: [12],
        },
      ],
      poi_types: [
        {
          id: 6,
          name: {it: 'esempio filtro ', en: 'example'},
        },
        {
          id: 5,
          name: {it: 'esempio filtro bis', en: 'example'},
        },
      ],
    };
    let call = this._communicationService.get(`${environment.api}/api/ec/search/${searchstring}`);
    call = of(mock);
    const res = await call.toPromise();
    return res;
  }

  private async _getFromCache(cacheId: string): Promise<any> {
    const res = await this._storageService.getByKey(cacheId);
    return res;
  }

  private async _setInCache(cacheId, value) {
    return this._storageService.setByKey(cacheId, value);
  }
}
