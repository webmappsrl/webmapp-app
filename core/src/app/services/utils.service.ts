import { Injectable } from '@angular/core';
import { StorageService } from './base/storage.service';
import { DownloadService } from './download.service';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private imgCache: Array<{ key: string, value: string | ArrayBuffer }> = [];

  constructor(
    private download: DownloadService,
    private storage: StorageService
  ) { }

  async getB64img(url: string): Promise<string | ArrayBuffer> {
    if (!url) { return null; }
    const cached = this.imgCache.find(x => x.key == url);
    if (cached) {
      return cached.value;
    }
    else {

      let base64data = await this.storage.getImage(url);

      if (!base64data) {
        base64data = await DownloadService.downloadBase64Img(url) as string;
      }

      this.imgCache.push({ key: url, value: base64data })
      return base64data;
    }

  }
}
