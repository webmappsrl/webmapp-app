import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { IRegisterItem, ITrack } from '../types/track';
import { WaypointSave } from '../types/waypoint';
import { IPhotoItem, PhotoService } from './photo.service';

// eslint-disable-next-line @typescript-eslint/naming-convention
const { Storage } = Plugins;

export enum ESaveObjType {
  PHOTO = 'photo',
  PHOTOTRACK = 'phototrack',
  TRACK = 'track',
  WAYPOINT = 'waypoint',
}

interface ISaveIndexObj {
  key: string;
  type: ESaveObjType;
  saved: boolean;
  edited: boolean;
  deleted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  private _indexKey = 'index';
  private _index: { lastId: number; objects: ISaveIndexObj[] } = {
    lastId: 0,
    objects: [],
  };

  constructor(private _photoService: PhotoService) {
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

  /**
   * Get all the object save on storage but not on the cloud
   */
  public async getUnsavedObjects() {}

  public async getWaypoints(): Promise<WaypointSave[]> {
    return this.getGeneric(ESaveObjType.WAYPOINT);
  }

  public async getPhotos(): Promise<IPhotoItem[]> {
    return this.getGeneric(ESaveObjType.PHOTO);
  }

  public async getTracks(): Promise<ITrack[]> {
    const ret: ITrack[] = await this.getGeneric(ESaveObjType.TRACK);
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

  public async getGeneric(type: ESaveObjType): Promise<any[]> {
    const res = [];
    const keys = await Storage.keys();
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
    const ret = await Storage.get({ key });
    if (ret && ret.value && ret.value !== 'null') {
      returnObj = JSON.parse(ret.value);
      returnObj.key = key;
    }
    return returnObj;
  }

  private async _deleteGeneric(key): Promise<any> {
    await Storage.remove({ key });
    const indexObj = this._index.objects.find((x) => x.key === key);
    indexObj.deleted = true;
    await this._updateIndex();
  }

  private async _updateGeneric(key, value: IRegisterItem): Promise<any> {
    await Storage.remove({ key });
    await Storage.set({ key, value: JSON.stringify(value) });
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
    await Storage.set({ key, value: JSON.stringify(object) });
    await this._updateIndex();
    return key;
  }

  private _getLastId() {
    return this._index.lastId++;
  }

  private async _recoverIndex() {
    const ret = await Storage.get({ key: this._indexKey });
    if (ret && ret.value && ret.value !== 'null') {
      this._index = JSON.parse(ret.value);
    }
  }

  private async _updateIndex() {
    await Storage.set({
      key: this._indexKey,
      value: JSON.stringify(this._index),
    });
  }

  private _initTrack(track: ITrack) {
    const gj = track.geojson;
    track.geojson = Object.assign(new CGeojsonLineStringFeature(), gj);
  }
}
