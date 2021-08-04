/* eslint-disable @typescript-eslint/naming-convention */

import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { RegisterItem, Track } from '../types/track';
import { WaypointSave } from '../types/waypoint';
import { PhotoItem, PhotoService } from './photo.service';

const { Storage } = Plugins;

export enum SaveObjType {
  PHOTO = 'photo',
  PHOTOTRACK = 'phototrack',
  TRACK = 'track',
  WAYPOINT = 'waypoint',
}

interface SaveIndexObj {
  key: string;
  type: SaveObjType;
  saved: boolean;
  edited: boolean;
  deleted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  private indexKey = 'index';
  private index: { lastId: number; objects: SaveIndexObj[] } = {
    lastId: 0,
    objects: [],
  };

  constructor(private photoService: PhotoService) {
    this.recoverIndex();
  }

  /**
   * Save a photo into the storage
   *
   * @param photo the photo to be saved
   */
  public async savePhoto(photo: PhotoItem) {
    await this.photoService.setPhotoData(photo);
    await this.saveGeneric(photo, SaveObjType.PHOTO);
  }

  /**
   * Save a waypoint into the storage
   *
   * @param waypoint the waypoint to be saved
   */
  public async saveWaypoint(waypoint: WaypointSave) {
    await this.saveGeneric(waypoint, SaveObjType.WAYPOINT);
  }

  /**
   * Save a track and its photos into the storage
   *
   * @param track the track to be saved
   */
  public async saveTrack(track: Track) {
    const photoKeys: string[] = [];
    for (const photoTrack of track.photos) {
      const photoKey = await this.savePhotoTrack(photoTrack);
      photoKeys.push(photoKey);
    }
    const trackCopy = Object.assign({}, track);
    trackCopy.photoKeys = photoKeys;
    trackCopy.photos = null;
    await this.saveGeneric(trackCopy, SaveObjType.TRACK);
  }

  public async updateTrack(newTrack: Track) {
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
    this.updateGeneric(trackToSave.key, trackToSave);
  }

  /**
   * Get all the object save on storage but not on the cloud
   */
  public async getUnsavedObjects() {}

  public async getWaypoints(): Promise<WaypointSave[]> {
    return this.getGeneric(SaveObjType.WAYPOINT);
  }

  public async getPhotos(): Promise<PhotoItem[]> {
    return this.getGeneric(SaveObjType.PHOTO);
  }

  public async getTracks(): Promise<Track[]> {
    const ret: Track[] = await this.getGeneric(SaveObjType.TRACK);
    ret.forEach((t) => {
      this.initTrack(t);
    });
    return ret;
  }

  public async getTrack(key: string): Promise<Track> {
    const ret = await this.getGenericById(key);
    this.initTrack(ret);
    return ret;
  }

  public async getTrackPhotos(track: Track): Promise<PhotoItem[]> {
    const coll = [];
    for (const photoKey of track.photoKeys) {
      const photo = await this.getGenericById(photoKey);
      coll.push(photo);
    }
    return coll;
  }

  public async getGeneric(type: SaveObjType): Promise<any[]> {
    const res = [];
    const keys = await Storage.keys();
    for (const obj of this.index.objects) {
      if (obj.type === type && !obj.deleted) {
        const ret = await this.getGenericById(obj.key);
        if (ret) {
          res.push(ret);
        }
      }
    }
    return res;
  }

  private async getGenericById(key): Promise<any> {
    let returnObj = null;
    const ret = await Storage.get({ key });
    if (ret && ret.value && ret.value !== 'null') {
      returnObj = JSON.parse(ret.value);
      returnObj.key = key;
    }
    return returnObj;
  }

  private async deleteGeneric(key): Promise<any> {
    await Storage.remove({ key });
    const indexObj = this.index.objects.find((x) => x.key === key);
    indexObj.deleted = true;
    await this.updateIndex();
  }

  private async updateGeneric(key, value: RegisterItem): Promise<any> {
    await Storage.remove({ key });
    await Storage.set({ key, value: JSON.stringify(value) });
    const indexObj = this.index.objects.find((x) => x.key === key);
    indexObj.edited = true;
    await this.updateIndex();
  }

  private async savePhotoTrack(photo: PhotoItem): Promise<string> {
    await this.photoService.setPhotoData(photo);
    return await this.saveGeneric(photo, SaveObjType.PHOTOTRACK);
  }

  private async saveGeneric(
    object: RegisterItem,
    type: SaveObjType
  ): Promise<string> {
    const key = type + this.getLastId();
    const insertObj: SaveIndexObj = {
      key,
      type,
      saved: false,
      edited: false,
    };
    this.index.objects.push(insertObj);
    await Storage.set({ key, value: JSON.stringify(object) });
    await this.updateIndex();
    return key;
  }

  private getLastId() {
    return this.index.lastId++;
  }

  private async recoverIndex() {
    const ret = await Storage.get({ key: this.indexKey });
    if (ret && ret.value && ret.value !== 'null') {
      this.index = JSON.parse(ret.value);
    }
  }

  private async updateIndex() {
    await Storage.set({
      key: this.indexKey,
      value: JSON.stringify(this.index),
    });
  }

  private initTrack(track: Track) {
    const gj = track.geojson;
    track.geojson = Object.assign(new CGeojsonLineStringFeature(), gj);
  }
}
