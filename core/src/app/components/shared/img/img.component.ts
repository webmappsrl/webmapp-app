import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DownloadService } from 'src/app/services/download.service';
import { IWmImage } from 'src/app/types/model';

@Component({
  selector: 'webmapp-img',
  templateUrl: './img.component.html',
  styleUrls: ['./img.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ImgComponent implements OnInit {

  public image: string | ArrayBuffer = null;

  @Input("size") size: string;

  @Input("src") set setSrc(src: IWmImage | string) {
    this.loadImage(src);
  }

  constructor(
    private download: DownloadService,
  ) { }

  ngOnInit() {

  }

  async loadImage(imageSrc: IWmImage | string) {
    if (!imageSrc) return;
    let url = imageSrc as string;
    if (typeof (imageSrc) !== 'string') {
      if (this.size && imageSrc.sizes[this.size]) { url = imageSrc.sizes[this.size] }
      else {
        url = imageSrc.url
      }
    }
    this.image = await this.download.getB64img(url);
  }

}
