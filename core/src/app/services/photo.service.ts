import { Injectable } from '@angular/core';
import { DeviceService } from './base/device.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
// import { Media } from '@capacitor-community/media';

// const media = new Media();



export interface PhotoItem {
  id: string;
  photoURL: string;
}

@Injectable({
  providedIn: 'root'
})

export class PhotoService {

  private options = {
    // Android only. Max images to be selected, defaults to 15. If this is set to 1, upon
    // selection of a single image, the plugin will return it.
    maximumImagesCount: 100,

    // max width and height to allow the images to be.  Will keep aspect
    // ratio no matter what.  So if both are 800, the returned image
    // will be at most 800 pixels wide and 800 pixels tall.  If the width is
    // 800 and height 0 the image will be 800 pixels wide if the source
    // is at least that wide.
    //width: 1000,
    //height: 1000,

    // quality of resized image, defaults to 100
    quality: 100,

    // output type, defaults to FILE_URIs.
    // available options are
    // window.imagePicker.OutputType.FILE_URI (0) or
    // window.imagePicker.OutputType.BASE64_STRING (1)
    outputType: 0
  };
  constructor(private imagePicker: ImagePicker,
    private _deviceService: DeviceService
  ) { }

  async getPhotos(dateLimit: Date = null): Promise<PhotoItem[]> {
    const res: PhotoItem[] = [];
    if (!this._deviceService.isBrowser) {
      const images = await this.imagePicker.getPictures(this.options);
      for (let i = 0; i < images.length; i++) {
        res.push({
          id: i + '',
          photoURL: images[i]
        });
      }
      return res;
    } else {
      const max = 1 + Math.random() * 8;
      for (let i = 0; i < max; i++) {
        res.push({
          id: '1',
          photoURL: `https://picsum.photos/50${i}/75${i}`
        });
      }
      return res;
    }

  }
}
