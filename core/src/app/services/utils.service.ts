import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  static imgCache: Array<{ key: string, value: string | ArrayBuffer }> = [];

  constructor() { }

  static async getB64img(url: string): Promise<string | ArrayBuffer> {
    if (!url) { return null; }
    const cached = this.imgCache.find(x => x.key == url);
    if (cached) {
      return cached.value;
    }
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        this.imgCache.push({ key: url, value: base64data })
        resolve(base64data);
      }
    });
  }
}
