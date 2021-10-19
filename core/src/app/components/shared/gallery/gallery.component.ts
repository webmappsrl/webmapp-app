import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
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

  @Input("images") set setImages(images:any[]){
    this.images = images;
    images.forEach(img=>{
      this.getImage(img.u);
    })
  }

  @Input("startImage") set setStart(imgIdx: number) {
    setTimeout(() => {
      if (this.slider) {
        this.slider.slideTo(imgIdx);
        this.actualIndex = imgIdx+1;
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
    slidesPerView: 1
  };


  constructor(
    private download: DownloadService
  ) { }

  ngOnInit() { }

  close() {
    this.closing.emit(true)
  }


  getImage(url) {
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

  async changeIndex(ev){
    const idx = await this.slider.getActiveIndex();
    this.actualIndex = idx+1;
  }

}
