/* eslint-disable max-len */
import {Injectable} from '@angular/core';
import {DeviceService} from './base/device.service';
// import { File } from '@ionic-native/file/ngx';
// import { FilePath } from '@ionic-native/file-path/ngx';
import {Capacitor} from '@capacitor/core';
import {
  Camera,
  CameraResultType,
  CameraDirection,
  CameraSource,
  GalleryImageOptions,
} from '@capacitor/camera';
import {HttpClient} from '@angular/common/http';
import {IRegisterItem} from '../types/track';
import {Filesystem, Directory, GetUriResult} from '@capacitor/filesystem';
import {GeolocationService} from './geolocation.service';
import {ActionSheetController} from '@ionic/angular';
import {Location} from 'src/app/types/location';
import {LangService} from 'wm-core/localization/lang.service';

export interface IPhotoItem extends IRegisterItem {
  blob?: Blob;
  datasrc: string;
  description?: string;
  exif?: any;
  id: string;
  photoURL: string;
  position: Location;
  rawData?: string;
}

export const UGC_MEDIA_DIRECTORY: string = 'ugc_media';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private _isBase64 = false;
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
    outputType: this._isBase64 ? 1 : 0,
  };
  private translations = [];

  constructor(
    private _deviceService: DeviceService,
    private _http: HttpClient, // private file: File, // private filePath: FilePath,
    private geoLocationService: GeolocationService,
    private translate: LangService,
    private actionSheetController: ActionSheetController,
  ) {
    setTimeout(() => {
      this.translate
        .get([
          'modals.photo.popover.title',
          'modals.photo.popover.library',
          'modals.photo.popover.shot',
          'modals.photo.popover.cancel',
        ])
        .subscribe(t => {
          this.translations = t;
        });
    }, 2000);
  }

  async addPhotos(): Promise<IPhotoItem[]> {
    let retProm = new Promise<IPhotoItem[]>((resolve, reject) => {
      this.actionSheetController
        .create({
          header: this.translations['modals.photo.popover.title'],
          buttons: [
            {
              text: this.translations['modals.photo.popover.shot'],
              handler: () => {
                this.shotPhoto(false).then(photo => resolve([photo]));
              },
            },
            {
              text: this.translations['modals.photo.popover.library'],
              handler: () => {
                this.getPhotos(null).then(photos => resolve(photos));
              },
            },
            {
              text: this.translations['modals.photo.popover.cancel'],
              role: 'cancel',
              handler: () => {
                reject();
              },
            },
          ],
        })
        .then(actionSheet => {
          actionSheet.present();
        });
    });

    return retProm;
  }

  public async getPhotoData(photoUrl: string): Promise<any> {
    const blob = await this._http
      .get(Capacitor.convertFileSrc(photoUrl), {responseType: 'blob'})
      .toPromise();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onloadend = () => {
        resolve(
          JSON.stringify({
            arrayBuffer: Array.from(new Uint8Array(<ArrayBuffer>reader.result)),
            blobType: blob.type,
          }),
        );
      };
      reader.onerror = reject;
    });
  }

  /**
   * Return the photo blob to send
   *
   * @param {IPhotoItem} photo
   *
   * @returns {Blob} the blob
   */
  public async getPhotoFile(photo: IPhotoItem): Promise<Blob> {
    let blob: Blob, arrayBuffer: ArrayBuffer, blobType: string;

    if (photo.rawData) {
      let rawData = JSON.parse(photo.rawData);
      if (rawData.arrayBuffer) arrayBuffer = new Uint8Array(rawData.arrayBuffer).buffer;
      if (rawData.blobType) blobType = rawData.blobType;
    }

    if (!!arrayBuffer) {
      blob = new Blob([arrayBuffer]);
      blob = blob.slice(0, blob.size, blobType);
    } else {
      blob = await this._http.get(photo.photoURL, {responseType: 'blob'}).toPromise();
    }
    return blob;
  }

  async getPhotos(dateLimit: Date = null): Promise<IPhotoItem[]> {
    const res: IPhotoItem[] = [];
    let filePath = null;
    if (!this._deviceService.isBrowser) {
      if (!(await Camera.checkPermissions())) {
        await Camera.requestPermissions();
        if (!(await Camera.checkPermissions())) return res;
      }
      const options: GalleryImageOptions = {
        quality: 100, //	number	The quality of image to return as JPEG, from 0-100		1.2.0
        // width:	10000, //number	The width of the saved image		1.2.0
        // height:10000,	//number	The height of the saved image		1.2.0
        // correctOrientation: false, // 	boolean	Whether to automatically rotate the image “up” to correct for orientation in portrait mode	: true	1.2.0
        // presentationStyle:	'fullscreen' | 'popover'	// iOS only: The presentation style of the Camera.	: 'fullscreen'	1.2.0
        // limit : 100 //	number	iOS only: Maximum number of pictures the user will be able to choose.	0 (unlimited)	1.2.0
      };
      const gallery = await Camera.pickImages(options);
      for (let i = 0; i < gallery.photos.length; i++) {
        let data = Capacitor.convertFileSrc(gallery.photos[i].webPath); //TODO check source of file
        filePath = gallery.photos[i].path;

        res.push({
          id: i + '',
          photoURL: filePath,
          datasrc: data,
          description: '',
          date: new Date(),
          position: this.geoLocationService.location,
          exif: gallery.photos[i].exif,
        });
      }
      return res;
    } else {
      const max = 1 + Math.random() * 8;
      for (let i = 0; i < max; i++) {
        res.push({
          id: '' + i + 1,
          photoURL: `https://picsum.photos/50${i}/75${i}`,
          datasrc: `https://picsum.photos/50${i}/75${i}`,
          description: '',
          date: new Date(),
          position: this.geoLocationService.location,
        });
      }
      return res;
    }
  }

  /**
   * Copy the photo to a local stable directory
   *
   * @param photo the photo to save
   *
   * @returns {Promise<string>} with the new photo location
   */
  public async savePhotoToDataDirectory(photo: IPhotoItem): Promise<string> {
    let split: Array<string> = photo.photoURL.split('/'),
      filename: string = split.pop(),
      directoryExists: boolean = false;
    // TODO: Understand how to copy the file from a http url
    if (photo.photoURL.substring(0, 4) !== 'file' && photo.photoURL[0] !== '/')
      return photo.photoURL;

    if (this._deviceService.isIos && photo.photoURL[0] === '/')
      photo.photoURL = 'file://' + photo.photoURL;

    try {
      await Filesystem.readdir({
        path: UGC_MEDIA_DIRECTORY,
        directory: Directory.Data,
      });
      directoryExists = true;
    } catch (e) {
      directoryExists = false;
    }

    if (!directoryExists) {
      await Filesystem.mkdir({
        path: UGC_MEDIA_DIRECTORY,
        directory: Directory.Data,
        recursive: true,
      });
    }

    await Filesystem.copy({
      from: photo.photoURL,
      to: UGC_MEDIA_DIRECTORY + '/' + filename,
      toDirectory: Directory.Data,
    });

    const uriResult: GetUriResult = await Filesystem.getUri({
      path: UGC_MEDIA_DIRECTORY + '/' + filename,
      directory: Directory.Data,
    });

    return Capacitor.convertFileSrc(uriResult.uri);
  }

  public async setPhotoData(photo: IPhotoItem): Promise<void> {
    if (photo == null) return;
    const photoURL = photo.photoURL;
    if (photoURL && photoURL.indexOf(UGC_MEDIA_DIRECTORY) === -1) {
      photo.photoURL = await this.savePhotoToDataDirectory(photo);
    }

    if (!photo.rawData) photo.rawData = JSON.stringify({});
    try {
      let rawData = JSON.parse(photo.rawData);
      if (!rawData?.arrayBuffer)
        photo.rawData = await this.getPhotoData(photo.photoURL ? photo.photoURL : photo.datasrc);
      photo.blob = await this.getPhotoFile(photo);
    } catch (e) {
      console.log('Error setting photo blob', e);
    }
  }

  async shotPhoto(allowlibrary): Promise<IPhotoItem> {
    if (!this.geoLocationService.active) await this.geoLocationService.start();
    const photo = await Camera.getPhoto({
      quality: 90,
      // allowEditing: true,
      resultType: CameraResultType.Uri,
      // saveToGallery: true, //boolean	Whether to save the photo to the gallery. If the photo was picked from the gallery, it will only be saved if edited. Default: false
      // width: 10000,//	number	The width of the saved image
      // height: 10000,//	number	The height of the saved image
      // preserveAspectRatio: true, //	boolean	Whether to preserve the aspect ratio of the image.If this flag is true, the width and height will be used as max values and the aspect ratio will be preserved.This is only relevant when both a width and height are passed.When only width or height is provided the aspect ratio is always preserved(and this option is a no- op).A future major version will change this behavior to be default, and may also remove this option altogether.Default: false
      // correctOrientation: true,	//boolean	Whether to automatically rotate the image “up” to correct for orientation in portrait mode Default: true
      source: CameraSource.Camera, //CameraSource	The source to get the photo from.By default this prompts the user to select either the photo album or take a photo.Default: CameraSource.Prompt
      direction: CameraDirection.Rear, //CameraDirection	iOS and Web only: The camera direction.Default: CameraDirection.Rear
      // presentationStyle: 'fullscreen',	//"fullscreen" | "popover"	iOS only: The presentation style of the Camera.Defaults to fullscreen.
      webUseInput: this._deviceService.isBrowser ? null : true, //boolean	Web only: Whether to use the PWA Element experience or file input.The default is to use PWA Elements if installed and fall back to file input.To always use file input, set this to true.Learn more about PWA Elements: https://capacitorjs.com/docs/pwa-elements
      promptLabelHeader: this.translations['modals.photo.popover.title'], //string	If use CameraSource.Prompt only, can change Prompt label.default: promptLabelHeader: ‘Photo’ // iOS only promptLabelCancel : ‘Cancel’ // iOS only promptLabelPhoto : ‘From Photos’ promptLabelPicture : ‘Take Picture’
      promptLabelCancel: this.translations['modals.photo.popover.cancel'], //string
      promptLabelPhoto: this.translations['modals.photo.popover.library'], //string
      promptLabelPicture: this.translations['modals.photo.popover.shot'], //string
    });
    const res: IPhotoItem = {
      id: '1',
      photoURL: photo.path,
      datasrc: Capacitor.convertFileSrc(photo.webPath),
      description: '',
      date: new Date(),
      position: this.geoLocationService.location,
      exif: photo.exif,
    };
    return res;
  }
}
