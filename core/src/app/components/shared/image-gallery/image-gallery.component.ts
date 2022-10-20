import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {IonModal, ModalController} from '@ionic/angular';

import {BehaviorSubject} from 'rxjs';
import {ModalImageComponent} from './modal-image/modal-image.component';

@Component({
  selector: 'wm-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGalleryComponent {
  @ViewChild(IonModal) modal: IonModal;

  sliderOptions$: BehaviorSubject<any> = new BehaviorSubject<any>({
    slidesPerView: 1.3,
  });
  imageGallery$: BehaviorSubject<null | any[]> = new BehaviorSubject<null | any[]>(null);
  @Input() set imageGallery(imgGallery: any[]) {
    if (imgGallery && imgGallery.length === 1) {
      this.sliderOptions$.next({
        slidesPerView: 1,
      });
    } else {
      this.sliderOptions$.next({
        slidesPerView: 1.3,
      });
    }
    this.imageGallery$.next(imgGallery);
  }
  constructor(private _modalCtrl: ModalController) {}
  async showPhoto(idx) {
    const modal = await this._modalCtrl.create({
      component: ModalImageComponent,
      componentProps: {idx, imageGallery: this.imageGallery$.value},
    });
    modal.present();
  }
}
