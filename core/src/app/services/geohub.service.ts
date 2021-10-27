import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { GEOHUB_DOMAIN, GEOHUB_PROTOCOL } from '../constants/geohub';
import { TAXONOMYWHERE_STORAGE_KEY } from '../constants/storage';
import { EGeojsonGeometryTypes } from '../types/egeojson-geometry-types.enum';
import { ILocation } from '../types/location';
import { SearchStringResult } from '../types/map';
import { IGeojsonClusterApiResponse, IGeojsonFeature, IGeojsonPoi, IGeojsonPoiDetailed, ILineString, IPoint, WhereTaxonomy } from '../types/model';
import { ITrack } from '../types/track';
import { WaypointSave } from '../types/waypoint';
import { CommunicationService } from './base/communication.service';
import { StorageService } from './base/storage.service';
import { ConfigService } from './config.service';
import { IPhotoItem } from './photo.service';

const FAVOURITE_PAGESIZE = 3;

@Injectable({
  providedIn: 'root',
})
export class GeohubService {

  constructor(
    private _communicationService: CommunicationService,
    private _storageService: StorageService,
    private configService: ConfigService
  ) { }

  /**
   * Get an instance of the specified ec track
   *
   * @param {string} id the ec track id
   *
   * @returns {CGeojsonLineStringFeature}
   */
  async getEcTrack(id: string | number): Promise<CGeojsonLineStringFeature> {
    const fondo = ['asfalto', 'lastricato', 'naturale']
    const res = await this._communicationService
      .get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/${id}`)
      .pipe(map((res: CGeojsonLineStringFeature) => {
        let lastAlt = 0; let idx = 0
        res.geometry.coordinates.forEach(coord => {
          coord.push(Math.abs(coord[2] - lastAlt)); //pendenza
          lastAlt = coord[2];
          coord.push(fondo[Math.round(idx / 30) % 3]);
          idx++;
        })
        res.properties.praticability = [{
          name: { it: "Trekking" },
          icon: 'trekking'
        }, {
          name: { it: "A cavallo" },
          icon: 'horse'
        }, {
          name: { it: "In bici" },
          icon: 'bike'
        }]
        return res;
      }))
      .toPromise();
    return res;
  }

  // /**
  //  * Get an instance of the specified ec track
  //  *
  //  * @param {string} id the ec track id
  //  *
  //  * @returns {IGeojsonFeature}
  //  */
  // async getEcRoute(id: string): Promise<IGeojsonFeature> {
  //   return this._getMockFeature();
  // }

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
   * Perform a search with the given params
   *
   * @returns {Array<RouteCluster>}
   */
  async search(boundingbox: number[], filters, referenceTrackId: number): Promise<IGeojsonClusterApiResponse> {
    let url = `${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/search?bbox=${boundingbox[0]},${boundingbox[1]},${boundingbox[2]},${boundingbox[3]}`;
    if (referenceTrackId) {
      url += `&reference_id=${referenceTrackId}`;
    }
    const res = await this._communicationService
      .get(url)
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
      .get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/nearest/${location.longitude}/${location.latitude}`).pipe(map(x => x.features))
      .toPromise();
    return res;
  }


  async saveWaypoint(waypoint: WaypointSave) {
    const data = {
      type: 'Feature',
      geometry:
      {
        type: EGeojsonGeometryTypes.POINT,
        coordinates: [waypoint.position.latitude, waypoint.position.longitude]
      },
      properties: {
        name: waypoint.title,
        description: waypoint.description,
        app_id: this.configService.appId,
        // gallery:,
      }
    }
    const res = await this._communicationService.post(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ugc/poi/store`, data).toPromise();
    return res;
  }


  async savePhoto(photo: IPhotoItem) {
    const geojson = {
      type: 'Feature',
      geometry: null,
      properties: {
        description: photo.description,
        app_id: this.configService.appId,
      }
    }

    const data = new FormData();
    data.append('image', photo.rawData);
    data.append('geojson', JSON.stringify(geojson));


    const res = await this._communicationService.post(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ugc/media/store`, data).toPromise();
    return res;
  }


  async saveTrack(track: ITrack) {
    const geometry = JSON.parse(JSON.stringify(track.geojson.geometry));
    geometry.coordinates = geometry.coordinates.map((x: any) => { return [x[0], x[1]] })
    const data = {
      type: 'Feature',
      geometry: geometry,
      properties: {
        name: track.title,
        description: track.description,
        app_id: this.configService.appId,
        gallery: (track.photos) ? track.photos.map(x => x.id) : [],
      }
    }
    const res = await this._communicationService.post(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ugc/track/store`, data).toPromise();
    return res;
  }




  // api/ugc/track/store api-auth 
  // geojson
  // prop.name string
  // prop.description string
  // prop.app_id da config
  // prop.gallery (array di id già aggiunti con add media)
  // geometry=point




  /**
   * Get an array with the closest ec tracks to the specified location
   *
   * @returns {Array<IGeojsonFeature>}
   */
  async getMostViewedEcTracks(): Promise<Array<IGeojsonFeature>> {
    const res = await this._communicationService
      .get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/most_viewed`,).pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  async getDetailsPoisForTrack(id: number): Promise<Array<IGeojsonPoiDetailed>> {
    const mock = {
      "type": "FeatureCollection",
      "features": [
        {
          "properties": {
            "id": 1,
            "image": "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/83_150x150.jpg",
            images: ['https://picsum.photos/250/150', 'https://picsum.photos/250/150'],
            name: { it: 'esempio', en: 'example' },
            description: { it: 'descrizione poi', en: 'desc' },
            email: 'pippo@gmail.com',
            phone: '12345678',
            address: 'Via di qua 0',
            url: 'http://www.google.com'
          },
          "geometry": {
            "type": "Point",
            "coordinates": [11.1022, 42.66137]
          }
        },
        {
          "properties": {
            "id": 2,
            "image": "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/107_150x150.jpg",
            images: ['https://picsum.photos/250/150', 'https://picsum.photos/250/150', 'https://picsum.photos/250/150', 'https://picsum.photos/250/150'],
            name: { it: 'esempio 2 ', en: 'example' },
            description: {
              it: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce consectetur dapibus risus et euismod. Curabitur vel elit arcu. Vestibulum vehicula porttitor lacus, et sodales lorem vehicula vel. Quisque commodo mi id faucibus mollis. Nam porttitor, enim nec consequat commodo, dui lacus suscipit ante, in scelerisque lectus nibh eu turpis. Nulla metus risus, tristique vitae cursus vitae, hendrerit quis dolor. Donec tincidunt quis nulla sed lobortis. Aliquam eget nunc fringilla, fermentum sem ac, condimentum neque. Phasellus id aliquet sem, nec facilisis orci. Maecenas ultricies sollicitudin auctor. Cras quis orci placerat neque viverra tempor. Mauris et dolor rutrum, rutrum elit a, consectetur sem. Sed a erat nunc. Aliquam suscipit tincidunt semper. Morbi maximus eros diam.
                        Praesent dapibus, turpis in pulvinar efficitur, justo elit pulvinar lectus, non varius quam massa et sapien. Integer pulvinar diam lacus, in aliquam massa efficitur at. Suspendisse interdum auctor erat et lobortis. Sed a quam nunc. Mauris vitae erat placerat, interdum magna ac, accumsan urna. Suspendisse eu suscipit dolor. In hac habitasse platea dictumst. Cras volutpat risus a magna scelerisque, sed facilisis leo ullamcorper. In placerat ante a metus molestie euismod. Nulla ante sem, sollicitudin at dolor vel, fermentum ornare erat. Quisque posuere vitae risus ac porta. Nullam dapibus tincidunt quam non dictum. Vestibulum scelerisque nunc et lectus ornare, vitae mattis ante dictum. Aliquam erat volutpat. Praesent congue lacus mi, sed consequat nibh dapibus vel. Suspendisse potenti.
                        Cras gravida eros felis, sit amet commodo odio convallis id. In mi eros, pretium sed magna a, rutrum pretium neque. Suspendisse feugiat aliquet nunc non venenatis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Vestibulum pellentesque dictum dictum. Aenean ultrices consectetur congue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce ullamcorper nisl dolor, a dapibus magna fermentum vel. Donec a maximus lectus. Donec posuere hendrerit enim placerat imperdiet. Aliquam commodo est lacus, at lacinia erat volutpat ac. Quisque in nisl aliquam, lobortis ante at, aliquam diam. Sed eu sagittis arcu. Nulla facilisi. Nam egestas sem tellus, eu ultricies neque ultrices sit amet.
                        Morbi efficitur magna a vestibulum auctor. Praesent pellentesque risus ac urna scelerisque, non consequat justo commodo. Curabitur viverra lacus non magna tristique consectetur quis eu dolor. Etiam consectetur ornare nibh eget tempor. Fusce pulvinar, lacus eget dictum finibus, tortor elit finibus libero, ac convallis est enim nec risus. Duis faucibus, urna ac placerat blandit, justo tortor mattis arcu, in euismod arcu neque ac turpis. Duis sodales massa vel laoreet tempor. Suspendisse fringilla neque ut ante aliquet, vel rhoncus erat semper. Donec ut lacinia lorem, sed porta massa. Suspendisse quis nisi at lorem accumsan ornare. Duis tristique metus at sapien viverra ullamcorper. Curabitur venenatis justo nibh, sed venenatis nulla elementum eu. Nullam vulputate urna maximus vestibulum suscipit. Phasellus semper lacus vitae lacinia convallis. Cras tempus nec lorem vitae faucibus.
                        Pellentesque ac nibh eros. Pellentesque tempus consectetur metus, eu euismod augue. Aenean a facilisis felis. Suspendisse potenti. Proin venenatis, nunc a dictum fermentum, nibh augue dignissim lacus, ut congue dui ante ut est. Mauris cursus faucibus eros, ut euismod urna. Duis ut tempor nulla. Nunc facilisis semper diam vitae aliquam. Pellentesque non imperdiet odio. Donec accumsan viverra metus eu sollicitudin. In elit neque, tristique in turpis et, rutrum gravida mi.`, en: 'desc'
            }
          },
          "geometry": {
            "type": "Point",
            "coordinates": [11.108, 42.658]
          }
        }
      ]
    }
    let call = this._communicationService.get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/get_related_simple/${id}`,)
    call = of(mock);
    const res = await call.pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  async getPoiForTrack(id: number): Promise<Array<IGeojsonPoi>> {
    const mock = {
      "type": "FeatureCollection",
      "features": [
        {
          "properties": {
            "id": 1,
            "image": "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/83_150x150.jpg"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [11.1022, 42.66137]
          }
        },
        {
          "properties": {
            "id": 2,
            "image": "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/107_150x150.jpg"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [11.108, 42.658]
          }
        }
      ]
    }
    let call = this._communicationService.get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/get_related_simple/${id}`,)
    call = of(mock);
    const res = await call.pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  public async stringSearch(searchstring: string): Promise<SearchStringResult> { //TODO real mock and result type
    const mock: SearchStringResult = {
      places: [
        {
          "id": 1,
          name: { it: 'esempio 2 ', en: 'example' },
          "bbox": [11.1022, 42.66137, 11.108, 42.658]
        },
        {
          "id": 2,
          name: { it: `Lorem ipsum dolor sit amet, `, en: 'desc' },
          "bbox": [11.1022, 42.66137, 11.108, 42.658]
        },
      ],
      ec_tracks: [
        {
          "id": 22,
          "image": "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/107_150x150.jpg",
          name: { it: 'esempio traccia ', en: 'example' },
          "where": [1]
        },
        {
          "id": 25,
          "image": "https://ecmedia.s3.eu-central-1.amazonaws.com/EcMedia/Resize/150x150/83_150x150.jpg",
          name: { it: 'esempio traccia bis  ', en: 'example' },
          "where": [12]
        }
      ],
      poi_types: [
        {
          "id": 6,
          name: { it: 'esempio filtro ', en: 'example' }
        },
        {
          "id": 5,
          name: { it: 'esempio filtro bis', en: 'example' }
        },
      ]
    }
    let call = this._communicationService.get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/search/${searchstring}`,)
    call = of(mock);
    const res = await call.toPromise();
    return res;
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
    const res = await this._communicationService.get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/taxonomy/where/${id}`,)
      .pipe(map(value => {
        delete value.geometry;
        this._setInCache(cacheId, value);
        return value;
      }))
      .toPromise();
    return res;
  }

  private _favourites: Array<number> = null;

  async getFavouriteTracks(page: number = 0): Promise<Array<IGeojsonFeature>> {
    const favourites = await this.favourites();

    let ids: number[] = [];
    if (favourites) {
      ids = favourites.slice(page * FAVOURITE_PAGESIZE, (page + 1) * FAVOURITE_PAGESIZE);
    }

    return this.getTracks(ids);
  }

  async getTracks(ids: number[]): Promise<Array<IGeojsonFeature>> {
    const res = await this._communicationService
      .get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/multiple?ids=${ids.join(',')}`).pipe(map(x => x.features))
      .toPromise();
    return res;
  }

  async favourites(): Promise<number[]> {
    if (!this._favourites) {
      try {
        const { favorites } = await this._communicationService.get(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/favorite/list`).toPromise();
        this._favourites = favorites;
      }
      catch (err) {
        console.log("------- ~ GeohubService ~ favourites ~ err", err);
      }
    }
    return this._favourites;
  }

  async setFavouriteTrack(trackId: number, isFavourite: boolean): Promise<boolean> {

    if (isFavourite) {
      await this._communicationService.post(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/favorite/add/${trackId}`, null).toPromise();
    } else {
      await this._communicationService.post(`${GEOHUB_PROTOCOL}://${GEOHUB_DOMAIN}/api/ec/track/favorite/remove/${trackId}`, null).toPromise();
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

  async isFavouriteTrack(trackId: number): Promise<boolean> {
    const favourites = await this.favourites();
    if (favourites && favourites.length) {
      return !!favourites.find(x => x == trackId);
    }
    return false;
  }

  /**
   * Get an instance of the specified geohub feature
   *
   * @param {string} id the feature id
   *
   * @returns {IGeojsonFeature}
   */
  private _getFeature<T extends IGeojsonFeature>(id: string): T {
    return undefined;
  }

  private async _getMockFeature(): Promise<IGeojsonFeature> {
    const res = await this._communicationService
      .get('https://geohub.webmapp.it/api/ec/track/18')
      .toPromise();
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
