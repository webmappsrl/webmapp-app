import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { Track } from '../types/track.d.';
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
}

@Injectable({
  providedIn: 'root'
})
export class SaveService {

  private indexKey = 'index';
  private index = {
    lastId: 0,
    objects: []
  };


  constructor(
    private photoService: PhotoService
  ) {
    this.recoverIndex();
    console.log("----------storage", Storage);
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
    trackCopy.photos = photoKeys;
    await this.saveGeneric(trackCopy, SaveObjType.TRACK);
  }

  /**
   * Get all the object save on storage but not on the cloud
   */
  public async getUnsavedObjects() {

  }


  public async getWaypoints(): Promise<WaypointSave[]> {
    return this.getGeneric(SaveObjType.WAYPOINT);
  }

  public async getPhotos(): Promise<PhotoItem[]> {
    return this.getGeneric(SaveObjType.PHOTO);
  }

  public async getTracks(): Promise<Track[]> {
    const ret: Track[] = await this.getGeneric(SaveObjType.TRACK);
    return ret;
  }

  public async getTrackPhoto(key: string): Promise<PhotoItem> {
    const ret = await Storage.get({ key });
    return JSON.parse(ret.value);
  }

  public async getGeneric(type: SaveObjType): Promise<any[]> {
    const res = [];
    const keys = await Storage.keys();
    for (const obj of this.index.objects) {
      if (obj.type === type) {
        const ret = await Storage.get({ key: obj.key });
        if (ret && ret.value && ret.value !== 'null') {
          res.push(JSON.parse(ret.value));
        }
      }
    }
    return res;
  }


  private async savePhotoTrack(photoUrl: string): Promise<string> {
    const data = await this.photoService.getPhotoData(photoUrl);

    return await this.saveGeneric(data, SaveObjType.PHOTOTRACK);
  }


  private async saveGeneric(object: any, type: SaveObjType): Promise<string> {
    const key = type + this.getLastId();
    const insertObj: SaveIndexObj = {
      key,
      type,
      saved: false
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
      value: JSON.stringify(this.index)
    });
  }




}
