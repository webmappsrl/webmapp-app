import { Injectable } from '@angular/core';
import { DeviceService } from './base/device.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
// import { File } from '@ionic-native/file/ngx';
// import { FilePath } from '@ionic-native/file-path/ngx';
import { Filesystem } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';


export interface PhotoItem {
  id: string;
  photoURL: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})

export class PhotoService {

  private useBase64 = false;

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
    outputType: this.useBase64 ? 1 : 0
  };

  constructor(
    private imagePicker: ImagePicker,
    private _deviceService: DeviceService,
    // private file: File,
    // private filePath: FilePath,
  ) { }

  async getPhotos(dateLimit: Date = null): Promise<PhotoItem[]> {
    const res: PhotoItem[] = [];
    let filePath = null;
    if (!this._deviceService.isBrowser) {

      if (!await this.imagePicker.hasReadPermission()) {
        await this.imagePicker.requestReadPermission();
        if (!await this.imagePicker.hasReadPermission())
          return res;
      }

      const images = await this.imagePicker.getPictures(this.options);
      for (let i = 0; i < images.length; i++) {
        let data = null;
        if (this.useBase64) {
          data = `data:image/jpeg;base64,${images[i]}`;
        } else {
          data = Capacitor.convertFileSrc(images[i]);
          filePath = images[i];
        }
        res.push({
          id: i + '',
          photoURL: filePath,
          data
        });
      }
      return res;
    } else {
      const max = 1 + Math.random() * 8;
      for (let i = 0; i < max; i++) {
        res.push({
          id: '1',
          photoURL: `https://picsum.photos/50${i}/75${i}`,
          data: `https://picsum.photos/50${i}/75${i}`
        });
      }
      return res;
    }

  }
}
