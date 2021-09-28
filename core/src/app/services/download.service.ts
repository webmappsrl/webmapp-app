import { Injectable } from '@angular/core';
import { interval, ReplaySubject } from 'rxjs';
import { DownloadedTrackComponents, DownloadStatus } from '../types/download';
import { IGeojsonFeature, IGeojsonFeatureDownloaded } from '../types/model';
import { GeohubService } from './geohub.service';
import { StatusService } from 'src/app/services/status.service';
import { DbService } from './base/db.service';
import { promise } from 'selenium-webdriver';
import { StorageService } from './base/storage.service';
import { CommunicationService } from './base/communication.service';
import { environment } from 'src/environments/environment';
import { GEOHUB_TILES_DOMAIN } from '../constants/geohub';
import { DOWNLOAD_INDEX_KEY } from '../constants/storage';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  public onChangeStatus: ReplaySubject<DownloadStatus> = new ReplaySubject<DownloadStatus>(1);

  private _status: DownloadStatus;

  private downloadIndex: DownloadedTrackComponents[];

  constructor(
    private _geohubservice: GeohubService,
    private _statusService: StatusService,
    private storage: StorageService,
    // private communicationService: CommunicationService,
    // private db: DbService
  ) {
    this.storage.getByKey(DOWNLOAD_INDEX_KEY).then(val => {
      if (val) { this.downloadIndex = val; }
      else { this.downloadIndex = []; }
    })
  }

  async saveIndex() {
    return this.storage.setByKey(DOWNLOAD_INDEX_KEY, this.downloadIndex);
  }

  async isDownloadedTrack(trackId: number): Promise<boolean> {
    const track = this.downloadIndex.find(x => x.trackId === trackId);
    return !!track;
  }

  async startDownload(track: IGeojsonFeature | IGeojsonFeatureDownloaded) {
    let sizeMb = 0
    //check already downloaded and connection
    if (await this.isDownloadedTrack(track.properties.id)) {
      this.updateStatus({ finish: true })
      return;
    }

    this.createNewStatus();

    this.updateStatus({
      finish: false,
      setup: 1
    })


    // downaload mbtiles (MAP)
    // const mbtiles = ['2/2/1', '7/67/47', '11/1086/755', '11/1087/755'];
    const mbtiles = track.properties.mbtiles;
    sizeMb += await this.downloadMBtiles(mbtiles); // TODO async


    const imageUrlList: string[] = [];

    // download track with geojson (data) - DB key=trackid
    const pois = this._statusService.getRelatedPois();
    const dataTotal = 1 + pois.length;
    sizeMb += await this.saveTrack(track, dataTotal); // TODO async
    console.log("------- ~ DownloadService ~ startDownload ~ track.properties", track.properties);
    imageUrlList.push(track.properties.feature_image.url);
    if (track.properties.image_gallery) {
      track.properties.image_gallery.forEach(img => {
        imageUrlList.push(img.url);
      })
    }

    const poisIds = [];
    // download poi (data) - DB key=poiId ??    
    for (let i = 0; i < pois.length; i++) {
      const poi = pois[i];
      poisIds.push(poi.properties.id);
      imageUrlList.push(poi.properties.image);
      for (let j = 0; j < poi.properties.images.length; j++) {
        const imgUrl = poi.properties.images[j];
        imageUrlList.push(imgUrl);
        sizeMb += await this.savePoi(poi, dataTotal) // TODO async
      };
    }

    sizeMb += await this.downloadImages(imageUrlList, track); // TODO async

    this.downloadIndex.push({
      trackId: track.properties.id,
      tiles: mbtiles,
      images: imageUrlList,
      pois: poisIds
    })
    this.saveIndex();

    this.updateTrackSize(track as IGeojsonFeatureDownloaded, sizeMb)

    //TODO rollback?
  }

  async downloadMBtiles(tilesIDs: string[]): Promise<number> {

    if (!tilesIDs) {
      this.updateStatus({
        finish: false,
        map: 1
      })
      return 0;
    }

    let totalSize = 0;
    for (let i = 0; i < tilesIDs.length; i++) {
      const tilesId = tilesIDs[i];

      // TODO check already downloaded mbtiles

      const tileData = (await DownloadService.downloadFile(`${GEOHUB_TILES_DOMAIN}/raster/${tilesId}.mbtiles`)); // TODO can do in async way

      totalSize += tileData.byteLength;

      await this.storage.setMBTiles(tilesId, tileData);
      this.updateStatus({
        finish: false,
        map: 1 / tilesIDs.length
      })
    }
    return totalSize;




    //save to disk -> progress event

    this.updateStatus({ finish: false, map: 1, setup: 1 })
    return 1;
  }

  async saveTrack(track: IGeojsonFeature, objTotal: number): Promise<number> {
    await this.storage.setTrack(track.properties.id, track);
    this.updateStatus({
      finish: false,
      data: 1 / objTotal
    })
    return JSON.stringify(track).length;
  }

  async savePoi(poi, objTotal): Promise<number> {
    await this.storage.setPoi(poi.properties.id, poi);
    this.updateStatus({
      finish: false,
      data: 1 / objTotal
    })
    return JSON.stringify(poi).length;
  }

  async downloadImages(urlList: string[], referenceTrack): Promise<number> {
    let totalSize = 0;
    for (let i = 0; i < urlList.length; i++) {


      // TODO check already downloaded images

      const url = urlList[i];
      const imgB64 = await DownloadService.downloadBase64Img(url) as string; // TODO can do in async way
      totalSize += imgB64.length;

      await this.storage.setImage(url, imgB64);
      this.updateStatus({
        finish: false,
        media: 1 / urlList.length
      })
    }
    return totalSize;
  }

  async updateTrackSize(track: IGeojsonFeatureDownloaded, size: number) {
    track.size = size;
    this.updateStatus({
      finish: false,
      install: 1
    })
    await this.storage.setTrack(track.properties.id, track);
  }


  removeDownload(trackId: number) {
    //TODO delete downloaded elements

    // check index relation
    // delete media
    // delete track & poi
    // delete mbtiles
    //delete relation
  }

  createNewStatus() {
    this._status = {
      finish: false,
      setup: 0,
      map: 0,
      data: 0,
      media: 0,
      install: 0
    };
  }

  updateStatus(statusUpdate: DownloadStatus) {
    if (statusUpdate.finish) {
      this.onChangeStatus.next(statusUpdate);
      return;
    }

    const update = (old, sum): number => {
      return Math.min(1, old + (sum ? sum : 0))
    }

    this._status.setup = update(this._status.setup, statusUpdate.setup)
    this._status.map = update(this._status.map, statusUpdate.map)
    this._status.data = update(this._status.data, statusUpdate.data)
    this._status.media = update(this._status.media, statusUpdate.media)
    this._status.install = update(this._status.install, statusUpdate.install)

    if (
      this._status.setup > 0.99 &&
      this._status.map > 0.99 &&
      this._status.data > 0.99 &&
      this._status.media > 0.99 &&
      this._status.install > 0.99
    ) {
      this._status.finish = true;
    }

    this.onChangeStatus.next(this._status);
  }

  async getDownloadedTracks(): Promise<Array<IGeojsonFeatureDownloaded>> {
    const downloaded = [22, 23];

    let ids: number[] = downloaded.slice(0);

    const res = await this._geohubservice.getTracks(ids);
    const ret = [];
    res.forEach(t => {
      const t2 = Object.assign({ size: 5 }, t);
      ret.push(t2);
    })
    return ret;
  }

  static async downloadBase64Img(url): Promise<string | ArrayBuffer> {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      try {
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        }
      } catch (error) {
        console.log("------- ~ UtilsService ~ getB64img ~ error", error);
        resolve('');
      }
    });
  }

  static async downloadFile(url): Promise<ArrayBuffer> {
    const data = await fetch(url);

    return data.arrayBuffer();

    //   const blob = await data.blob();
    //   return new Promise((resolve) => {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(blob);
    //     try {
    //       reader.onloadend = () => {
    //         const base64data = reader.result;
    //         resolve(base64data);
    //       }
    //     } catch (error) {
    //       console.log("------- ~ UtilsService ~ downloadFile ~ error", error);
    //       resolve('');
    //     }
    //   });
  }
}
