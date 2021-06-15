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
      const res = [
        {
          id: '1',
          photoURL: 'https://picsum.photos/500/750',
          thumbnailURL: 'https://picsum.photos/200/300',
          fileName: 'fineName',
          width: '500',
          height: '750',
          creationDate: new Date(),
          latitude: null,
          longitude: null,
          albumIds: 'test',

        },
        {
          id: '2',
          photoURL: 'https://picsum.photos/600/900',
          thumbnailURL: 'https://picsum.photos/180/270',
          fileName: 'fineName2',
          width: '600',
          height: '900',
          creationDate: new Date(),
          latitude: null,
          longitude: null,
          albumIds: 'test',

        }
      ];
      return [...res,...res,...res];
    }

  }
}
