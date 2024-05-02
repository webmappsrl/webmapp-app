import {Injectable} from '@angular/core';
import {forkJoin, from, Observable} from 'rxjs';
import {CGeojsonLineStringFeature} from '../classes/features/cgeojson-line-string-feature';
import {ISaveIndexObj} from '../types/save';
import {ESaveObjType} from '../types/save.enum';
import {IRegisterItem, ITrack} from '../types/track';
import {WaypointSave} from '../types/waypoint';
import {StorageService} from './base/storage.service';
import {GeohubService} from './geohub.service';
import {IPhotoItem, PhotoService} from './photo.service';
import {FeatureCollection, Feature} from 'geojson';
import {EGeojsonGeometryTypes} from '../types/egeojson-geometry-types.enum';
@Injectable({
  providedIn: 'root',
})
export class SaveService {
  private _index: {lastId: number; objects: ISaveIndexObj[]} = {
    lastId: 0,
    objects: [],
  };
  private _indexKey = 'index';

  constructor(
    private _photoService: PhotoService,
    private _storage: StorageService,
    private geohub: GeohubService,
  ) {
    this._recoverIndex();
  }

  deletePhoto(photo: IPhotoItem): Observable<any> {
    return forkJoin({
      deleteFromAPI: this.geohub.deletePhoto(+photo.id),
      deleteFromSTORAGE: from(this._deleteGeneric(photo.key)),
    });
  }

  deleteTrack(track: ITrack): Observable<any> {
    return forkJoin({
      deleteFromAPI: this.geohub.deleteTrack(+track.id),
      deleteFromSTORAGE: from(this._deleteGeneric(track.key)),
    });
  }

  deleteWaypoint(waypoint: WaypointSave): Observable<any> {
    return forkJoin({
      deleteFromAPI: this.geohub.deleteWaypoint(+waypoint.id),
      deleteFromSTORAGE: from(this._deleteGeneric(waypoint.key)),
    });
  }

  public async getGenerics(type: ESaveObjType): Promise<any[]> {
    const res = [];
    for (const obj of this._index.objects) {
      if (obj.type === type && !obj.deleted) {
        const ret = await this._getGenericById(obj.key);
        if (ret) {
          res.push(ret);
        }
      }
    }
    return res.reverse();
  }

  public async getPhoto(key: string): Promise<IPhotoItem> {
    return this._getGenericById(key);
  }

  public async getPhotos(): Promise<IPhotoItem[]> {
    return this.getGenerics(ESaveObjType.PHOTO);
  }

  public async getTrack(key: string): Promise<ITrack> {
    const ret = await this._getGenericById(key);
    await this._initTrack(ret);
    return ret;
  }

  public async getTrackPhotos(track: ITrack): Promise<IPhotoItem[]> {
    const coll = [];
    for (const photoKey of track.photoKeys || []) {
      const photo = await this._getGenericById(photoKey);
      coll.push(photo);
    }
    return coll;
  }

  public async getTracks(): Promise<ITrack[]> {
    const ret: ITrack[] = await this.getGenerics(ESaveObjType.TRACK);
    ret.forEach(async t => {
      await this._initTrack(t);
    });
    return ret;
  }

  /**
   * Get all the object save on storage but not on the cloud
   */
  public async getUnsavedObjects(): Promise<ISaveIndexObj[]> {
    let ret = this._index.objects.filter(X => X.saved === false);
    return ret;
  }

  public async getWaypoint(key: string): Promise<WaypointSave> {
    const wp = await this._getGenericById(key);
    for (let i = 0; i < (wp.storedPhotoKeys || []).length; i++) {
      const element = wp.storedPhotoKeys[i];
      const photo = await this._getGenericById(element);
      photo.rawData = window.URL.createObjectURL(await this._photoService.getPhotoFile(photo));
      wp.photos.push(photo);
    }
    return wp;
  }

  public async getWaypoints(): Promise<WaypointSave[]> {
    return this.getGenerics(ESaveObjType.WAYPOINT);
  }

  /**
   * Save a track and its photos into the storage
   *
   * @param track the track to be saved
   */
  public async restoreTrack(track: ITrack): Promise<ITrack> {
    const trackCopy = Object.assign({}, track);
    const key = await this._saveGeneric(trackCopy, ESaveObjType.TRACK, true);
    trackCopy.key = key;
    return trackCopy;
  }

  /**
   * Save a photo into the storage
   *
   * @param photo the photo to be saved
   */
  public async savePhoto(photo: IPhotoItem, skipUpload = false) {
    await this._photoService.setPhotoData(photo);
    await this._saveGeneric(photo, ESaveObjType.PHOTO, skipUpload);
  }

  /**
   * Save a photo into the storage
   *
   * @param photo the photo to be saved
   */
  public async savePhotos(photos: Array<IPhotoItem>, skipUpload = false) {
    for (let photo of photos) {
      await this.savePhoto(photo, skipUpload);
    }
  }

  /**
   * Save a track and its photos into the storage
   *
   * @param track the track to be saved
   */
  public async saveTrack(track: ITrack, skipUload = false): Promise<ITrack> {
    const trackCopy = Object.assign({}, track);
    const key = await this._saveGeneric(trackCopy, ESaveObjType.TRACK, skipUload);
    trackCopy.key = key;
    return trackCopy;
  }

  /**
   * Save a waypoint into the storage
   *
   * @param waypoint the waypoint to be saved
   */
  public async saveWaypoint(waypoint: WaypointSave, skipUpload = false): Promise<WaypointSave> {
    const waypointCopy = Object.assign({}, waypoint);
    const key = await this._saveGeneric(waypointCopy, ESaveObjType.WAYPOINT, skipUpload);
    waypointCopy.key = key;
    return waypointCopy;
  }

  async syncUgc(): Promise<void> {
    const geohubUgcTracks: FeatureCollection = await this.geohub.getUgcTracks();
    const geohubUgcPois: FeatureCollection = await this.geohub.getUgcPois();
    const geohubUgcMedias: FeatureCollection = await this.geohub.getUgcMedias();
    const deviceUgcMedias: any[] = await this.getPhotos();
    const deviceUgcTracks = await this.getTracks();
    const deviceUgcPois = await this.getWaypoints();
    if (geohubUgcTracks?.features && geohubUgcTracks?.features.length > deviceUgcTracks.length) {
      const deviceUgcTrackNames = deviceUgcTracks.map(f => f.title);
      const deviceUgcTrackUUID = deviceUgcTracks.map(f => f.uuid);
      geohubUgcTracks.features
        .filter(f => {
          const prop = f?.properties;
          const rawData = JSON.parse(prop.raw_data) ?? undefined;
          const name = prop?.name;
          const uuid = rawData?.uuid;
          return (
            deviceUgcTrackNames.indexOf(name) < 0 &&
            ((uuid && deviceUgcTrackUUID.indexOf(uuid) < 0) || uuid == null)
          );
        })
        .map(f => this._convertFeatureToITrack(f))
        .forEach(track => this.saveTrack(track, true));
    }
    if (geohubUgcPois?.features && geohubUgcPois?.features.length > deviceUgcPois.length) {
      const deviceUgcPoisNames = deviceUgcPois.map(f => f.title);
      const deviceUgcPoisUUID = deviceUgcPois.map(f => f.uuid);
      geohubUgcPois.features
        .filter(f => {
          const prop = f?.properties;
          const rawData = JSON.parse(prop.raw_data) ?? undefined;
          const name = prop?.name;
          const uuid = rawData?.uuid;
          return (
            deviceUgcPoisNames.indexOf(name) < 0 &&
            ((uuid && deviceUgcPoisUUID.indexOf(uuid) < 0) || uuid == null)
          );
        })
        .map(f => this._convertFeatureToWaypointSave(f))
        .forEach(poi => this.saveWaypoint(poi, true));
    }
    if (geohubUgcMedias?.features && geohubUgcMedias?.features.length > deviceUgcMedias.length) {
      const deviceUgcMediasNames = deviceUgcMedias.map(f => f.title);
      const deviceUgcMediasUUID = deviceUgcMedias.map(f => f.uuid);
      geohubUgcMedias.features
        .filter(f => {
          const prop = f?.properties;
          const rawData = JSON.parse(prop.raw_data) ?? undefined;
          const name = prop?.name;
          const uuid = rawData?.uuid;
          return (
            deviceUgcMediasNames.indexOf(name) < 0 &&
            ((uuid && deviceUgcMediasUUID.indexOf(uuid) < 0) || uuid == null)
          );
        })
        .map(f => this._convertFeatureToMedia(f))
        .forEach(media => this.savePhoto(media, true));
    }
  }

  public async updateTrack(newTrack: ITrack) {
    const trackToSave = JSON.parse(JSON.stringify(newTrack));
    const originalTrack = await this.getTrack(trackToSave.key);

    const photoKeys: string[] = [];
    trackToSave.photoKeys = [];
    for (const photoTrack of trackToSave.photos) {
      photoKeys.push(photoTrack.key);
      trackToSave.photoKey.push(photoTrack.key);
    }
    trackToSave.photos = null;
    const deletedPhotos = originalTrack.photoKeys.filter(x => photoKeys.find(y => x !== y));

    for (const photokey of deletedPhotos) {
      //this.deleteGeneric(photokey);
    }
    trackToSave.photoKeys = photoKeys;
    this._updateGeneric(trackToSave.key, trackToSave);
  }

  public async uploadUnsavedContents() {
    //TODO what for edited or deleted contents?

    let contents = await this.getUnsavedObjects();
    contents = contents.sort((a, b) =>
      a.type == (ESaveObjType.PHOTO || a.type == ESaveObjType.PHOTOTRACK) ? 1 : -1,
    );

    for (let i = 0; i < contents.length; i++) {
      const indexObj = this._index.objects.find(x => x.key === contents[i].key);
      switch (contents[i].type) {
        case ESaveObjType.PHOTO:
          const photo: IPhotoItem = await this._getGenericById(contents[i].key);
          await this._photoService.setPhotoData(photo);
          const resP = await this.geohub.savePhoto(photo);
          if (resP && !resP.error && resP.id) {
            indexObj.saved = true;
            photo.id = resP.id;
            this._updateGeneric(contents[i].key, photo);
          }
          break;

        case ESaveObjType.WAYPOINT:
          const waypoint: WaypointSave = await this.getWaypoint(contents[i].key);

          if (waypoint?.photos?.length) {
            let i: number = 0;
            while (i < waypoint.photos.length) {
              const photo: IPhotoItem = waypoint.photos[i];
              const photoKey = await this._savePhotoTrack(photo);
              const photoStored: IPhotoItem = await this._getGenericById(photoKey);
              this._updateGeneric(photoKey, photoStored);
              try {
                const resP = await this.geohub.savePhoto(photo);
                if (resP && !resP.error && resP.id) {
                  if (!waypoint.photoKeys) waypoint.photoKeys = [];
                  if (!waypoint.storedPhotoKeys) waypoint.storedPhotoKeys = [];
                  waypoint.photoKeys.push(resP.id);
                  waypoint.storedPhotoKeys.push(photoKey);
                  waypoint.photos.splice(i, 1); // Photo uploaded correctly, delete it from the photos to upload
                } else {
                  console.warn('A waypoint photo could not be uploaded');
                  i++;
                }
              } catch (e) {
                console.warn('A waypoint photo could not be uploaded');
                i++;
              }
            }
          }

          if (!waypoint?.photos?.length) {
            let poiToGeohub = null;
            try {
              poiToGeohub = {
                ...waypoint,
                ...{
                  geojson: {
                    type: EGeojsonGeometryTypes.POINT,
                    coordinates: [waypoint.position.longitude, waypoint.position.latitude],
                  },
                },
              };
            } catch (e) {
              console.error(e);
              indexObj.saved = true;
              this._updateGeneric(contents[i].key, waypoint);
            }
            const resW = await this.geohub.saveWaypoint(waypoint);
            if (resW && !resW.error && resW.id) {
              indexObj.saved = true;
              waypoint.id = resW.id;
              this._updateGeneric(contents[i].key, waypoint);
            } else this._updateGeneric(contents[i].key, waypoint);
          } else this._updateGeneric(contents[i].key, waypoint);
          break;

        case ESaveObjType.TRACK:
          const track: ITrack = await this.getTrack(contents[i].key);

          if (track?.photos?.length) {
            let i: number = 0;
            while (i < track.photos.length) {
              const photo: IPhotoItem = track.photos[i];
              const photoKey = await this._savePhotoTrack(photo);
              const photoStored: IPhotoItem = await this._getGenericById(photoKey);
              this._updateGeneric(photoKey, photoStored);
              try {
                const resP = await this.geohub.savePhoto(photo);
                if (resP && !resP.error && resP.id) {
                  if (!track.photoKeys) track.photoKeys = [];
                  if (!track.storedPhotoKeys) track.storedPhotoKeys = [];
                  track.photoKeys.push(resP.id);
                  track.storedPhotoKeys.push(photoKey);
                  track.photos.splice(i, 1); // Photo uploaded correctly, delete it from the photos to upload
                } else {
                  console.warn('A track photo could not be uploaded');
                  i++;
                }
              } catch (e) {
                console.warn('A track photo could not be uploaded');
                i++;
              }
            }
          }

          if (!track?.photos?.length) {
            let trackToGeohub = null;
            try {
              trackToGeohub = {
                ...track,
                ...{
                  geojson: {
                    geometry: {
                      type:
                        (track as any).geojson?.geometry?.type ||
                        (track as any)?.geometry?.type ||
                        null,
                      coordinates:
                        ((track as any).geojson?.geometry?.coordinates ||
                          (track as any).geometry?.coordinates) ??
                        [],
                    },
                  },
                },
              };
            } catch (e) {
              console.error(e);
              indexObj.saved = true;
              this._updateGeneric(contents[i].key, track);
            }
            const resT = await this.geohub.saveTrack(trackToGeohub as any);
            if (resT && !resT.error && resT.id) {
              indexObj.saved = true;
              track.id = resT.id;
              this._updateGeneric(contents[i].key, track);
            } else this._updateGeneric(contents[i].key, track);
          } else this._updateGeneric(contents[i].key, track);
          break;

        case ESaveObjType.PHOTOTRACK:
          break;
      }
      await this._updateIndex();
    }
    this.syncUgc();
  }

  private _convertFeatureToITrack(feature: Feature): ITrack {
    const prop = feature.properties;
    const rawData = prop.raw_data ? JSON.parse(prop.raw_data) : null;
    const metaData = prop.metadata ? JSON.parse(prop.metadata) : null;
    let geojson: CGeojsonLineStringFeature =
      Object.assign(new CGeojsonLineStringFeature(), feature.geometry) ?? null;
    geojson.addProperties(rawData);
    geojson.addProperties(metaData);

    return {
      activity: rawData.activity ?? null,
      geojson,
      description: prop.description ?? null,
      id: prop.id ?? null,
      formId: rawData.id ?? null,
      metadata: metaData ?? null,
      photoKeys: prop.photoKeys ?? null,
      photos: prop.photos ?? null,
      rawData: rawData ?? null,
      storedPhotoKeys: prop.storedPhotoKeys ?? null,
      title: prop.name ?? null,
      date: prop.date,
      uuid: prop.uuid,
    } as ITrack;
  }

  //getPhotoData
  private _convertFeatureToMedia(feature: Feature): IPhotoItem {
    const prop = feature.properties;
    // const url = `https://geohub.webmapp.it/storage/${prop.relative_url}`;
    const rawData = prop.raw_data ? JSON.parse(prop.raw_data) : null;
    return {
      photoURL: prop.url,
      position: rawData.position,
      description: prop.description ?? '',
      date: prop.updated_at,
      uuid: rawData.uuid,
      id: prop.id,
    } as IPhotoItem;
  }

  private _convertFeatureToWaypointSave(feature: Feature): WaypointSave {
    const prop = feature.properties;
    const rawData = prop.raw_data ? JSON.parse(prop.raw_data) : null;
    return {
      city: rawData.city ?? null,
      date: prop.date,
      description: prop.description ?? null,
      displayPosition: rawData.displayPosition ?? null,
      id: prop.id ?? null,
      formId: rawData.id ?? null,
      nominatim: rawData.nominatim ?? null,
      photos: rawData.photos ?? [],
      position: {
        longitude: (feature.geometry as any).coordinates[0],
        latitude: (feature.geometry as any).coordinates[1],
      },
      title: prop.name ?? null,
      uuid: rawData.uuid,
    } as WaypointSave;
  }

  private async _deleteGeneric(key): Promise<any> {
    await this._storage.removeByKey(key);
    const indexObj = this._index.objects.find(x => x.key === key);
    indexObj.deleted = true;
    await this._updateIndex();
  }

  private _generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private async _getGenericById(key): Promise<any> {
    let returnObj = null;
    const ret = await this._storage.getByKey(key);
    if (ret) {
      returnObj = ret;
      returnObj.key = key;
    }
    return returnObj;
  }

  private _getLastId() {
    return this._index.lastId++;
  }

  private async _initTrack(track: ITrack) {
    const gj = track.geojson;
    try {
      track.geojson = Object.assign(new CGeojsonLineStringFeature(), gj);
    } catch (_) {}
    for (let i = 0; i < (track.storedPhotoKeys || []).length; i++) {
      const element = track.storedPhotoKeys[i];
      const photo = await this._getGenericById(element);
      photo.rawData = window.URL.createObjectURL(await this._photoService.getPhotoFile(photo));

      track.photos.push(photo);
    }
    if (track.metadata && typeof track.metadata === 'string') {
      let metadata = JSON.parse(track.metadata);
      if (metadata && metadata.locations) {
        track.geojson.setProperty('locations', metadata.locations);
      }
    }
  }

  private async _recoverIndex() {
    const ret = await this._storage.getByKey(this._indexKey);
    if (ret) {
      this._index = ret;
    }
  }

  private async _saveGeneric(
    object: IRegisterItem,
    type: ESaveObjType,
    skipUpload = false,
  ): Promise<string> {
    object.uuid = object.uuid ? object.uuid : this._generateUUID();
    const key = type + this._getLastId();
    const insertObj: ISaveIndexObj = {
      key,
      type,
      saved: skipUpload,
      edited: false,
    };
    this._index.objects.push(insertObj);
    await this._storage.setByKey(key, object);
    await this._updateIndex();

    if (!skipUpload) {
      //async call
      this.uploadUnsavedContents();
    }

    return key;
  }

  private async _savePhotoTrack(photo: IPhotoItem): Promise<string> {
    await this._photoService.setPhotoData(photo);
    return await this._saveGeneric(photo, ESaveObjType.PHOTO, true);
  }

  private async _updateGeneric(key, value: IRegisterItem): Promise<any> {
    await this._storage.removeByKey(key);
    await this._storage.setByKey(key, value);
    const indexObj = this._index.objects.find(x => x.key === key);
    indexObj.edited = true;
    await this._updateIndex();
  }

  private async _updateIndex() {
    await this._storage.setByKey(this._indexKey, this._index);
  }
}
