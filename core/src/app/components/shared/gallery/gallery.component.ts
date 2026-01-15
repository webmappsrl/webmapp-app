import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {} from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'webmapp-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {


  public images: any[];

  public actualIndex = 1;

  @ViewChild('slider', {read: ElementRef}) slider: ElementRef;

  @Output("closing") closing = new EventEmitter();

  @Input("images") set setImages(images: any[]) {
    this.images = images;
  }

  @Input("startImage") set setStart(imgIdx: number) {
    setTimeout(() => {
      const swiper = this.slider?.nativeElement?.swiper;
      if (swiper) {
        swiper.slideTo(imgIdx);
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
    preloadImages: true
  };


  constructor(
  ) { }

  ngOnInit() { }

  close() {
    this.closing.emit(true)
  }

  async changeIndex(ev) {
    const swiper = this.slider?.nativeElement?.swiper;
    if (swiper) {
      this.actualIndex = swiper.activeIndex + 1;
    }
  }

}
