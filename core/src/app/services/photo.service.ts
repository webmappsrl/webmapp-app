import { Injectable } from '@angular/core';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { DeviceService } from './base/device.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private photoLibrary: PhotoLibrary,
    private _deviceService: DeviceService
  ) { }

  async getPhotos(dateLimit: Date = null) {
    if (!this._deviceService.isBrowser) {
      await this.photoLibrary.requestAuthorization().catch(err => console.log('permissions weren\'t granted'));
      return await this.photoLibrary.getLibrary().toPromise();
    } else {
      const res = [], max = 1 + Math.random() * 8;
      for (let i = 0; i < max; i++) {
        res.push({
          id: '1',
          photoURL: `https://picsum.photos/50${i}/75${i}`,
          thumbnailURL: `https://picsum.photos/20${i}/30${i}`,
          fileName: 'fineName' + i,
          width: 500 + i,
          height: 750 + i,
          creationDate: new Date(),
          latitude: null,
          longitude: null,
          albumIds: 'test',
        });
      }
      return res;
    }

  }
}
