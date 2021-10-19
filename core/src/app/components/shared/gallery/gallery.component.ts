import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonSlides, LoadingController } from '@ionic/angular';
import { DownloadService } from 'src/app/services/download.service';

@Component({
  selector: 'webmapp-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {


  private cache: any = {};
  public images: any[];

  public actualIndex = 1;

  @ViewChild('slider') slider: IonSlides;

  @Output("closing") closing = new EventEmitter();

  @Input("images") set setImages(images: any[]) {
    this.images = images;
    this.loadImages(images);
  }

  @Input("startImage") set setStart(imgIdx: number) {
    setTimeout(() => {
      if (this.slider) {
        this.slider.slideTo(imgIdx);
        this.actualIndex = imgIdx + 1;
      }
      else {
        console.log("------- ~ GalleryComponent ~ setTimeout ~ this.slider", this.slider, imgIdx);

      }
    }, 0);
  }

  public sliderOptions: any = {
    initialSlide: 0,
    // speed: 400,
    // spaceBetween: 10,
    // slidesOffsetAfter: 15,
    // slidesOffsetBefore: 15,
    slidesPerView: 1,
    // autoHeight: true,
    // preloadImages: true
  };


  constructor(
    private download: DownloadService,
    private _loadingController: LoadingController
  ) { }

  ngOnInit() { }

  close() {
    this.closing.emit(true)
  }

  async loadImages(images) {
    const loadingComponent = await this._loadingController.create({
      // message: this.loadingString

    })
    await loadingComponent.present();
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const url = img.url || img;
      this.cache[url] = await this.download.getB64img(url);
    }
    loadingComponent.dismiss();
  }


  getImage(image) {
    let url = image.url || image;
    if (this.cache[url] && this.cache[url] != 'waiting') return this.cache[url]
    else {
      if (this.cache[url] !== 'waiting') {
        this.cache[url] = 'waiting';
        this.download.getB64img(url).then(val => {
          this.cache[url] = val;
        })
      }
    }
    return '';
  }

  async changeIndex(ev) {
    const idx = await this.slider.getActiveIndex();
    this.actualIndex = idx + 1;
  }

}
