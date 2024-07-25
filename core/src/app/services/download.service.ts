import {DownloadStatus, DownloadedTrackComponents} from '../types/download';
import {IGeojsonFeature, IGeojsonFeatureDownloaded} from '../types/model';
import {Observable, ReplaySubject} from 'rxjs';

import {DOWNLOAD_INDEX_KEY} from '../constants/storage';
import {IMapRootState} from '../store/map/map';
import {Injectable} from '@angular/core';
import {StorageService} from './base/storage.service';
import {Store} from '@ngrx/store';
import defaultImage from '../../assets/images/defaultImageB64.json';
import {mapCurrentRelatedPoi} from '../store/map/map.selector';
import {HttpClient} from '@angular/common/http';
import {downloadTiles, getTilesByGeometry, removeTiles} from '../shared/map-core/src/utils';
@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  private _relatedPoi: any[] = [];
  private _relatedPoi$: Observable<any[]> = this._storeMap.select(mapCurrentRelatedPoi);
  private downloadIndex: DownloadedTrackComponents[];
  private imgCache: Array<{key: string; value: string | ArrayBuffer | Blob}> = [];

  onChangeStatus: ReplaySubject<DownloadStatus> = new ReplaySubject<DownloadStatus>(1);
  status: DownloadStatus;

  constructor(
    private storage: StorageService,
    private _storeMap: Store<IMapRootState>, // private communicationService: CommunicationService, // private db: DbService
    private _http: HttpClient,
  ) {
    this.storage.onReady.subscribe(x => {
      this.storage.getByKey(DOWNLOAD_INDEX_KEY).then(val => {
        if (val) {
          this.downloadIndex = val;
        } else {
          this.downloadIndex = [];
        }
      });
    });
    this._relatedPoi$.subscribe(rp => {
      this._relatedPoi = rp;
    });
  }

  static async downloadFile(url: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(url, {mode: 'cors'});

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      return response.arrayBuffer();
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  addToIndex(obj: DownloadedTrackComponents): void {
    this.downloadIndex.push(obj);
    this.saveIndex();
  }

  createNewStatus(): void {
    this.status = {
      finish: false,
      setup: 0,
      map: 0,
      data: 0,
      media: 0,
      install: 0,
    };
  }

  async downloadBase64Img(url): Promise<string | ArrayBuffer> {
    try {
      let opt: RequestInit = {};
      // if (this.platform.is('mobile')) {
      //   opt = { mode: 'no-cors' };
      // }
      const data = await fetch(url, opt);
      const blob = await data.blob();
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        try {
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
          };
        } catch (error) {
          console.log('------- ~ getB64img ~ error', error);
          resolve(null);
        }
      });
    } catch (_) {
      console.warn(_, url);
      return new Promise(resolve => resolve(null));
    }
  }

  async downloadImages(urlList: string[], referenceTrack): Promise<number> {
    if (urlList == null || urlList.length === 0) {
      this.updateStatus({
        finish: false,
        media: 1,
      });
    }
    let totalSize = 0;
    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      if (url != null) {
        const existingFileName = await this.storage.getImageFilename(url);
        if (!existingFileName) {
          try {
            const imgB64 = (await this.downloadBase64Img(url)) as string; // TODO can do in async way
            totalSize += imgB64.length;
            await this.storage.setImage(url, imgB64);
          } catch (err) {
            console.log('------- ~ DownloadService ~ downloadImages ~ err', err);
          }
        }
      }
      this.updateStatus({
        finish: false,
        media: 1 / urlList.length,
      });
    }
    return totalSize;
  }

  public async getB64img(url: string): Promise<string | ArrayBuffer | Blob> {
    if (!url) {
      return defaultImage.image;
    }
    const cached = this.imgCache.find(x => {
      return x.key == url;
    });
    if (cached) {
      return cached.value;
    } else {
      let base64data = await this.storage.getImage(url);

      if (!base64data) {
        base64data = (await this.downloadBase64Img(url)) as string;
      }

      this.imgCache.push({key: url, value: base64data});
      return base64data;
    }
  }

  public async getDownloadedTrack(trackId): Promise<IGeojsonFeatureDownloaded> {
    return this.storage.getTrack(trackId);
  }

  public async getDownloadedTracks(): Promise<Array<IGeojsonFeatureDownloaded>> {
    const ret = [];
    for (let i = 0; i < this.downloadIndex.length; i++) {
      console.log(
        '------- ~ DownloadService ~ getDownloadedTracks ~ this.downloadIndex[i]',
        this.downloadIndex[i],
      );
      const res = await this.storage.getTrack(this.downloadIndex[i].trackId);
      ret.push(res);
    }

    return ret;
  }

  public getFromIndex(trackId: number): DownloadedTrackComponents {
    return this.downloadIndex.find(x => x.trackId === trackId);
  }

  public init() {}

  public async isDownloadedTrack(trackId: number): Promise<boolean> {
    const track = this.getFromIndex(trackId);
    return !!track;
  }

  public removeDownload(trackId: number) {
    const trackindex = this.getFromIndex(trackId);
    if (trackindex) {
      this.removeFromIndex(trackId);

      if (trackindex.tiles) {
        removeTiles(trackindex.tiles, trackId);
      }

      if (trackindex.pois) {
        trackindex.pois.forEach(poi => {
          if (!this.downloadIndex.find(x => x.pois.includes(poi))) {
            this.storage.removePoi(poi);
          }
        });
      }

      if (trackindex.images) {
        trackindex.images.forEach(image => {
          if (!this.downloadIndex.find(x => x.images.includes(image))) {
            this.storage.removeImage(image);
          }
        });
      }

      this.storage.removeTrack(trackId);
    }
  }

  public removeFromIndex(trackId: number) {
    const idx = this.downloadIndex.findIndex(x => x.trackId === trackId);
    if (idx >= 0) {
      this.downloadIndex.splice(idx, 1);
      this.saveIndex();
    }
  }

  public async saveIndex() {
    return this.storage.setByKey(DOWNLOAD_INDEX_KEY, this.downloadIndex);
  }

  public async savePoi(poi, objTotal): Promise<number> {
    await this.storage.setPoi(poi.properties.id, poi);
    this.updateStatus({
      finish: false,
      data: 1 / objTotal,
    });
    return JSON.stringify(poi).length;
  }

  public async saveTrack(track: IGeojsonFeature, objTotal: number): Promise<number> {
    if (track != null) {
      await this.storage.setTrack(track.properties.id, track);
      this.updateStatus({
        finish: false,
        data: 1 / objTotal,
      });
      return JSON.stringify(track).length;
    }
    return 0;
  }

  public async startDownload(track: IGeojsonFeature | IGeojsonFeatureDownloaded) {
    console.log('------- ~ DownloadService ~ startDownload ~ track', track);
    let sizeMb = 0;
    //check already downloaded and connection
    if (await this.isDownloadedTrack(track.properties.id)) {
      this.updateStatus({finish: true});
      console.log('------- ~ DownloadService ~ startDownload ~ finish');
      return;
    }

    this.createNewStatus();

    this.updateStatus({
      finish: false,
      setup: 1,
    });

    // downaload mbtiles (MAP)
    // const mbtiles = ['2/2/1', '7/67/47', '11/1086/755', '11/1087/755'];
    const mbtiles = getTilesByGeometry(track.geometry);
    sizeMb += await downloadTiles(mbtiles, track.properties.id, this.updateStatus.bind(this)); // TODO async

    const imageUrlList: string[] = [];

    // download track with geojson (data) - DB key=trackid
    const pois =
      this._relatedPoi != null
        ? this._relatedPoi.filter(
            p => p.properties != null && p.properties.image != null && p.properties.images != null,
          )
        : [];
    const dataTotal = 1 + pois.length;
    sizeMb += await this.saveTrack(track, dataTotal); // TODO async
    console.log('------- ~ DownloadService ~ startDownload ~ track.properties', track.properties);
    if (track.properties.feature_image && track.properties.feature_image.sizes) {
      imageUrlList.push(track.properties.feature_image.url);

      for (let p in track.properties.feature_image.sizes) {
        imageUrlList.push(track.properties.feature_image.sizes[p]);
      }
    }
    if (track.properties.image_gallery) {
      track.properties.image_gallery.forEach(async img => {
        imageUrlList.push(img.url);
        for (let p in img.sizes) {
          imageUrlList.push(img.sizes[p]);
        }
      });
    }

    const poisIds = [];
    // download poi (data) - DB key=poiId ??
    for (let i = 0; i < pois.length; i++) {
      const poi = pois[i];
      poisIds.push(poi.properties.id);
      imageUrlList.push(poi.properties.image);
      if (poi.properties.images) {
        for (let j = 0; j < poi.properties.images.length; j++) {
          const imgUrl = poi.properties.images[j];
          if (imgUrl) {
            imageUrlList.push(imgUrl);
          }
          sizeMb += await this.savePoi(poi, dataTotal); // TODO async
        }
      }
    }
    const images = [...new Set(this._findImageLinks(track).concat(imageUrlList))];
    sizeMb += await this.downloadImages(images, track); // TODO async

    this.addToIndex({
      trackId: track.properties.id,
      tiles: mbtiles,
      images: imageUrlList,
      pois: poisIds,
    });

    this.updateTrackSize(track as IGeojsonFeatureDownloaded, sizeMb);

    //TODO rollback?
  }

  public updateStatus(statusUpdate: DownloadStatus) {
    if (statusUpdate.finish) {
      this.onChangeStatus.next(statusUpdate);
      return;
    }

    const update = (old, sum): number => {
      return Math.min(1, old + (sum ? sum : 0));
    };

    this.status.setup = update(this.status.setup, statusUpdate.setup);
    this.status.map = update(this.status.map, statusUpdate.map);
    this.status.data = update(this.status.data, statusUpdate.data);
    this.status.media = update(this.status.media, statusUpdate.media);
    this.status.install = update(this.status.install, statusUpdate.install);

    if (
      this.status.setup > 0.99 &&
      this.status.map > 0.99 &&
      this.status.data > 0.99 &&
      this.status.media > 0.99 &&
      this.status.install > 0.99
    ) {
      this.status.finish = true;
    }
    this.onChangeStatus.next(this.status);

    if (this.status.finish) {
      this.createNewStatus();
      this.onChangeStatus.next(this.status);
    }
  }

  public async updateTrackSize(track: IGeojsonFeatureDownloaded, size: number) {
    const properties = {...track.properties, ...{size}};
    const newTrack = {...track, ...{properties}};
    this.updateStatus({
      finish: false,
      install: 1,
    });
    await this.storage.setTrack(newTrack.properties.id, newTrack);
  }

  private _findImageLinks(json: any): string[] {
    const links: string[] = [];

    function search(obj: any) {
      for (const prop in obj) {
        if (typeof obj[prop] === 'object') {
          search(obj[prop]);
        } else if (typeof obj[prop] === 'string') {
          const match = obj[prop].match(/\bhttps?:\/\/\S+(?:png|jpe?g|gif)\b/gi);
          if (match) {
            links.push(...match);
          }
        }
      }
    }

    search(json);

    return links;
  }
}
