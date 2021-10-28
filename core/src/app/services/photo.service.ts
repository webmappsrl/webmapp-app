/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { DeviceService } from './base/device.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
// import { File } from '@ionic-native/file/ngx';
// import { FilePath } from '@ionic-native/file-path/ngx';
import { CameraDirection, Plugins } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { IRegisterItem } from '../types/track';

export interface IPhotoItem extends IRegisterItem {
  id: string;
  photoURL: string;
  data: string;
  description?: string;
  rawData?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private _useBase64 = false;

  private _options = {
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
    outputType: this._useBase64 ? 1 : 0,
  };

  constructor(
    private _imagePicker: ImagePicker,
    private _deviceService: DeviceService,
    private _http: HttpClient // private file: File, // private filePath: FilePath,
  ) {}

  async getPhotos(dateLimit: Date = null): Promise<IPhotoItem[]> {
    const res: IPhotoItem[] = [];
    let filePath = null;
    if (!this._deviceService.isBrowser) {
      if (!(await this._imagePicker.hasReadPermission())) {
        await this._imagePicker.requestReadPermission();
        if (!(await this._imagePicker.hasReadPermission())) return res;
      }

      const images = await this._imagePicker.getPictures(this._options);
      for (let i = 0; i < images.length; i++) {
        let data = null;
        if (this._useBase64) {
          data = `data:image/jpeg;base64,${images[i]}`;
        } else {
          data = Capacitor.convertFileSrc(images[i]);
          filePath = images[i];
        }
        res.push({
          id: i + '',
          photoURL: filePath,
          data,
          description: '',
          date: new Date(),
        });
      }
      return res;
    } else {
      const max = 1 + Math.random() * 8;
      for (let i = 0; i < max; i++) {
        res.push({
          id: '1',
          photoURL: `https://picsum.photos/50${i}/75${i}`,
          data: `https://picsum.photos/50${i}/75${i}`,
          description: '',
          date: new Date(),
        });
      }
      return res;
    }
  }

  async shotPhoto(allowlibrary): Promise<IPhotoItem> {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      saveToGallery: true, //boolean	Whether to save the photo to the gallery. If the photo was picked from the gallery, it will only be saved if edited. Default: false
      // width: 100,//	number	The width of the saved image
      // height: 100,//	number	The height of the saved image
      preserveAspectRatio: true, //	boolean	Whether to preserve the aspect ratio of the image.If this flag is true, the width and height will be used as max values and the aspect ratio will be preserved.This is only relevant when both a width and height are passed.When only width or height is provided the aspect ratio is always preserved(and this option is a no- op).A future major version will change this behavior to be default, and may also remove this option altogether.Default: false
      // correctOrientation: true,	//boolean	Whether to automatically rotate the image “up” to correct for orientation in portrait mode Default: true
      // source: CameraSource.Camera,	//CameraSource	The source to get the photo from.By default this prompts the user to select either the photo album or take a photo.Default: CameraSource.Prompt
      direction: CameraDirection.Rear, //CameraDirection	iOS and Web only: The camera direction.Default: CameraDirection.Rear
      // presentationStyle: 'fullscreen',	//"fullscreen" | "popover"	iOS only: The presentation style of the Camera.Defaults to fullscreen.
      webUseInput: this._deviceService.isBrowser ? null : true, //boolean	Web only: Whether to use the PWA Element experience or file input.The default is to use PWA Elements if installed and fall back to file input.To always use file input, set this to true.Learn more about PWA Elements: https://capacitorjs.com/docs/pwa-elements
      // promptLabelHeader: null,	//string	If use CameraSource.Prompt only, can change Prompt label.default: promptLabelHeader: ‘Photo’ // iOS only promptLabelCancel : ‘Cancel’ // iOS only promptLabelPhoto : ‘From Photos’ promptLabelPicture : ‘Take Picture’
      // promptLabelCancel: null,	//string
      // promptLabelPhoto: null,	//string
      // promptLabelPicture: null,	//string
    });
    const res = {
      id: '1',
      photoURL: photo.webPath,
      data: Capacitor.convertFileSrc(photo.webPath),
      description: '',
      date: new Date(),
    };
    return res;
  }

  public async getPhotoData(photoUrl: string): Promise<any> {
    const filegot = await this._http
      .get(photoUrl, { responseType: 'blob' })
      .toPromise();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsBinaryString(filegot);
      reader.onloadend = () => {
        const binaryValue = reader.result;
        // console.log('Sync binary', binaryValue);
        resolve(binaryValue);
      };
      reader.onerror = reject;
    });
  }

  public async setPhotoData(photo: IPhotoItem) {
    photo.rawData = await this.getPhotoData(photo.photoURL);
  }
}
