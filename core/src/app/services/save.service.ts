import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
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
    await Storage.set({ key, value: JSON.stringify(object) });
    await this.updateIndex();
    return key;
  }

  private getLastId() {
    return this.index.lastId++;
  }

  private async recoverIndex() {
    const ret = await Storage.get({ key: this.indexKey });
    console.log('------- ~ file: save.service.ts ~ line 109 ~ SaveService ~ recoverIndex ~ ret', ret);
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
