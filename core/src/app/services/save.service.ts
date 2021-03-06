import { Injectable } from '@angular/core';
import { CGeojsonLineStringFeature } from '../classes/features/cgeojson-line-string-feature';
import { ILocation } from '../types/location';
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
   * Save a photo into the storage
   *
   * @param photo the photo to be saved
   */
  public async savePhotos(photos: Array<IPhotoItem>) {
    for (let photo of photos) {
      await this._photoService.setPhotoData(photo);
      await this._saveGeneric(photo, ESaveObjType.PHOTO, true);
    }
    this.uploadUnsavedContents();
  }

  /**
   * Save a waypoint into the storage
   *
   * @param waypoint the waypoint to be saved
   */
  public async saveWaypoint(waypoint: WaypointSave) {
    const waypointCopy = Object.assign({}, waypoint);
    await this._saveGeneric(waypointCopy, ESaveObjType.WAYPOINT);
  }

  /**
   * Save a track and its photos into the storage
   *
   * @param track the track to be saved
   */
  public async saveTrack(track: ITrack) {
    const trackCopy = Object.assign({}, track);
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

    let contents = await this.getUnsavedObjects();
    contents = contents.sort((a, b) =>
      a.type == (ESaveObjType.PHOTO || a.type == ESaveObjType.PHOTOTRACK)
        ? 1
        : -1
    );

    for (let i = 0; i < contents.length; i++) {
      const indexObj = this._index.objects.find(
        (x) => x.key === contents[i].key
      );
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
          const waypoint: WaypointSave = await this._getGenericById(
            contents[i].key
          );

          if (waypoint?.photos?.length) {
            let i: number = 0;
            while (i < waypoint.photos.length) {
              const photo: IPhotoItem = waypoint.photos[i];
              await this._photoService.setPhotoData(photo);
              try {
                const resP = await this.geohub.savePhoto(photo);
                if (resP && !resP.error && resP.id) {
                  if (!waypoint.photoKeys) waypoint.photoKeys = [];
                  waypoint.photoKeys.push(resP.id);
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
              await this._photoService.setPhotoData(photo);
              try {
                const resP = await this.geohub.savePhoto(photo);
                if (resP && !resP.error && resP.id) {
                  if (!track.photoKeys) track.photoKeys = [];
                  track.photoKeys.push(resP.id);
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
            const resT = await this.geohub.saveTrack(track);
            if (resT && !resT.error && resT.id) {
              indexObj.saved = true;
              track.id = resT.id;
              this._updateGeneric(contents[i].key, track);
            } else this._updateGeneric(contents[i].key, track);
          } else this._updateGeneric(contents[i].key, track);
          break;

        case ESaveObjType.PHOTOTRACK:
          console.warn('PHOTOTRACK elements should not exists');
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
    let ret = this._index.objects.filter((X) => X.saved === false);
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
    type: ESaveObjType,
    skipUpload?: boolean
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

    if (!skipUpload) {
      //async call
      this.uploadUnsavedContents();
    }

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
    await this._storage.setByKey(this._indexKey, this._index);
  }

  private _initTrack(track: ITrack) {
    const gj = track.geojson;
    track.geojson = Object.assign(new CGeojsonLineStringFeature(), gj);
  }
}
