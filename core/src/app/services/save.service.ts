import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { ISaveIndexObj } from '../types/save';
import { ESaveObjType } from '../types/save.enum';
import { IRegisterItem, ITrack } from '../types/track';
import { WaypointSave } from '../types/waypoint';
import { StorageService } from './base/storage.service';
import { GeohubService } from './geohub.service';
import { IPhotoItem, PhotoService } from './photo.service';


@Injectable({
  providedIn: 'root',
})
export class SaveService {
  private _indexKey = 'index';
  private _index: { lastId: number; objects: ISaveIndexObj[] } = {
    lastId: 0,
    objects: [],
  };

  constructor(
    private _photoService: PhotoService,
    private _storage: StorageService,
    private geohub: GeohubService
  ) {
    this._recoverIndex();
  }

  /**
   * Save a photo into the storage
   *
   * @param photo the photo to be saved
   */
  public async savePhoto(photo: IPhotoItem) {
    await this._photoService.setPhotoData(photo);
    await this._saveGeneric(photo, ESaveObjType.PHOTO);
  }

  /**
   * Save a waypoint into the storage
   *
   * @param waypoint the waypoint to be saved
   */
  public async saveWaypoint(waypoint: WaypointSave) {
    await this._saveGeneric(waypoint, ESaveObjType.WAYPOINT);
  }

  /**
   * Save a track and its photos into the storage
   *
   * @param track the track to be saved
   */
  public async saveTrack(track: ITrack) {
    const photoKeys: string[] = [];
    for (const photoTrack of track.photos) {
      const photoKey = await this._savePhotoTrack(photoTrack);
      photoKeys.push(photoKey);
    }
    const trackCopy = Object.assign({}, track);
    trackCopy.photoKeys = photoKeys;
    trackCopy.photos = null;
    await this._saveGeneric(trackCopy, ESaveObjType.TRACK);
  }

  public async updateTrack(newTrack: ITrack) {
    const trackToSave = JSON.parse(JSON.stringify(newTrack));
    const originalTrack = await this.getTrack(trackToSave.key);
    console.log(
      '------- ~ file: save.service.ts ~ line 82 ~ SaveService ~ updateTrack ~ originalTrack',
      originalTrack
    );
    const photoKeys: string[] = [];
    trackToSave.photoKeys = [];
    for (const photoTrack of trackToSave.photos) {
      photoKeys.push(photoTrack.key);
      trackToSave.photoKey.push(photoTrack.key);
    }
    trackToSave.photos = null;
    const deletedPhotos = originalTrack.photoKeys.filter((x) =>
      photoKeys.find((y) => x !== y)
    );
    console.log(
      '------- ~ file: save.service.ts ~ line 87 ~ SaveService ~ updateTrack ~ deletedPhotos',
      deletedPhotos
    );
    for (const photokey of deletedPhotos) {
      //this.deleteGeneric(photokey);
    }
    this._updateGeneric(trackToSave.key, trackToSave);
  }

  public async uploadUnsavedContents() {
    //TODO what for edited or deleted contents?
    const contents = await this.getUnsavedObjects();
    for (let i = 0; i < contents.length; i++) {
      const indexObj = this._index.objects.find((x) => x.key === contents[i].key);
      switch (contents[i].type) {
        case ESaveObjType.WAYPOINT:
          const waypoint: WaypointSave = await this._getGenericById(contents[i].key);
          const res = await this.geohub.saveWaypoint(waypoint);
          console.log("------- ~ SaveService ~ uploadUnsavedContents ~ res", res);
          if (res && !res.error && res.id) {
            indexObj.saved = true;
            // waypoint.id = res.id 
          }
          break;
        //TODO save each type of content
      }
      await this._updateIndex();

    }
  }

  /**
   * Get all the object save on storage but not on the cloud
   */
  public async getUnsavedObjects(): Promise<ISaveIndexObj[]> {
    let ret = this._index.objects.filter(X => X.saved === false);
    return ret;
  }

  public async getWaypoints(): Promise<WaypointSave[]> {
    return this.getGenerics(ESaveObjType.WAYPOINT);
  }

  public async getPhotos(): Promise<IPhotoItem[]> {
    return this.getGenerics(ESaveObjType.PHOTO);
  }

  public async getTracks(): Promise<ITrack[]> {
    const ret: ITrack[] = await this.getGenerics(ESaveObjType.TRACK);
    ret.forEach((t) => {
      this._initTrack(t);
    });
    return ret;
  }

  public async getTrack(key: string): Promise<ITrack> {
    const ret = await this._getGenericById(key);
    this._initTrack(ret);
    return ret;
  }

  public async getTrackPhotos(track: ITrack): Promise<IPhotoItem[]> {
    const coll = [];
    for (const photoKey of track.photoKeys) {
      const photo = await this._getGenericById(photoKey);
      coll.push(photo);
    }
    return coll;
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
    return res;
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

  private async _deleteGeneric(key): Promise<any> {
    await this._storage.removeByKey(key);
    const indexObj = this._index.objects.find((x) => x.key === key);
    indexObj.deleted = true;
    await this._updateIndex();
  }

  private async _updateGeneric(key, value: IRegisterItem): Promise<any> {
    await this._storage.removeByKey(key);
    await this._storage.setByKey(key, value);
    const indexObj = this._index.objects.find((x) => x.key === key);
    indexObj.edited = true;
    await this._updateIndex();
  }

  private async _savePhotoTrack(photo: IPhotoItem): Promise<string> {
    await this._photoService.setPhotoData(photo);
    return await this._saveGeneric(photo, ESaveObjType.PHOTOTRACK);
  }

  private async _saveGeneric(
    object: IRegisterItem,
    type: ESaveObjType
  ): Promise<string> {
    const key = type + this._getLastId();
    const insertObj: ISaveIndexObj = {
      key,
      type,
      saved: false,
      edited: false,
    };
    this._index.objects.push(insertObj);
    await this._storage.setByKey(key, object);
    await this._updateIndex();

    //async call
    this.uploadUnsavedContents();

    return key;
  }

  private _getLastId() {
    return this._index.lastId++;
  }

  private async _recoverIndex() {
    const ret = await this._storage.getByKey(this._indexKey);
    if (ret) {
      this._index = ret;
    }
  }

  private async _updateIndex() {
    await this._storage.setByKey(
      this._indexKey,
      this._index
    );
  }

  private _initTrack(track: ITrack) {
    const gj = track.geojson;
    track.geojson = Object.assign(new CGeojsonLineStringFeature(), gj);
  }
}
