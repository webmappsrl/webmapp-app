import { Injectable } from '@angular/core';
import { interval, ReplaySubject } from 'rxjs';
import { DownloadStatus } from '../types/download';
import { IGeojsonFeature, IGeojsonFeatureDownloaded } from '../types/model';
import { GeohubService } from './geohub.service';
import { StatusService } from 'src/app/services/status.service';
import { DbService } from './base/db.service';
import { promise } from 'selenium-webdriver';
import { StorageService } from './base/storage.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  public onChangeStatus: ReplaySubject<DownloadStatus> = new ReplaySubject<DownloadStatus>(1);

  private _status: DownloadStatus;

  constructor(
    private _geohubservice: GeohubService,
    private _statusService: StatusService,
    private storage: StorageService,
    // private db: DbService
  ) { }

  async isDownloadedTrack(trackId: number): Promise<boolean> {
    // const track = await this.db.getTrack(trackId);
    const track = await this.storage.getTrack(trackId);
    // FIXME remove
    return false;

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

    // downaload mbtiles (MAP)
    for (let i = 0; i < track.properties.mbtiles.length; i++) {
      const mbtileId = track.properties.mbtiles[i];
      sizeMb += await this.downloadMBtiles(mbtileId, track.properties.mbtiles.length) // TODO async
    }

    const imageUrlList: string[] = [];

    // download track with geojson (data) - DB key=trackid
    const pois = this._statusService.getRelatedPois();
    const dataTotal = 1 + pois.length;
    sizeMb += await this.saveTrack(track, dataTotal); // TODO async
    console.log("------- ~ DownloadService ~ startDownload ~ track.properties", track.properties);
    imageUrlList.push(track.properties.feature_image.url);
    track.properties.image_gallery.forEach(img => {
      imageUrlList.push(img.url);
    })

    // download poi (data) - DB key=poiId ??    
    for (let i = 0; i < pois.length; i++) {
      const poi = pois[i];
      imageUrlList.push(poi.properties.image);
      for (let j = 0; j < poi.properties.images.length; j++) {
        const imgUrl = poi.properties.images[j];
        imageUrlList.push(imgUrl);
        sizeMb += await this.savePoi(poi, dataTotal) // TODO async
      };
    }


    sizeMb += await this.downloadImages(imageUrlList, track); // TODO async

    this.updateTrackSize(track as IGeojsonFeatureDownloaded, sizeMb)

    //TODO rollback?
  }

  async downloadMBtiles(tilesID, totalTiles): Promise<number> {
    // TODO download tile

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
    //TODO add track-poi reference
    return JSON.stringify(poi).length;
  }

  async downloadImages(urlList: string[], referenceTrack): Promise<number> {
    let totalSize = 0;
    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      const imgB64 = await DownloadService.downloadBase64Img(url) as string; // TODO can do in async way
      totalSize += imgB64.length;

      await this.storage.setImage(url, imgB64);
      this.updateStatus({
        finish: false,
        media: 1 / urlList.length
      })
    }
    //TODO add track-image reference
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

    // check DB relation
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

  static async downloadBase64Img(url) : Promise<string | ArrayBuffer> {
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
}
