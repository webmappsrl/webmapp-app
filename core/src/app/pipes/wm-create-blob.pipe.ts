import {Pipe, PipeTransform} from '@angular/core';
import {IPhotoItem} from 'wm-core/services/photo.service';
import {Feature} from 'geojson';
@Pipe({
  name: 'wmCreateBlob',
  pure: false,
})
export class AppCreateBlobPipe implements PipeTransform {
  transform(photo: Feature): string {
    const properties = photo.properties;
    const rawData = properties.rawData;
    if (rawData) {
      if (typeof properties.rawData === 'string' && properties.rawData.includes('blob:')) {
        return properties.rawData;
      }
      if (rawData.arrayBuffer != null) {
        const url = `data:image/jpg;base64, ${this._arrayBufferToBase64(rawData.arrayBuffer)}`;
        return url;
      }
    }

    return properties.url;
  }

  private _arrayBufferToBase64(buffer): string {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
