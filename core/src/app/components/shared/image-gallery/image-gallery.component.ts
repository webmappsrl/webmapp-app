import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {IonModal, ModalController} from '@ionic/angular';

import {BehaviorSubject} from 'rxjs';
import {StorageService} from 'src/app/services/base/storage.service';
import {ModalImageComponent} from './modal-image/modal-image.component';

@Component({
  selector: 'wm-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGalleryComponent {
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

  @Input() offlineFn: (url: string) => Promise<any>;
  @ViewChild(IonModal) modal: IonModal;

  getStorageImage = (url: string) => {
    return this._storageSvc.getImage(url) as Promise<any>;
  };
  imageGallery$: BehaviorSubject<null | any[]> = new BehaviorSubject<null | any[]>(null);
  sliderOptions$: BehaviorSubject<any> = new BehaviorSubject<any>({
    slidesPerView: 1.3,
  });

  constructor(private _modalCtrl: ModalController, private _storageSvc: StorageService) {}

  async showPhoto(idx) {
    const modal = await this._modalCtrl.create({
      component: ModalImageComponent,
      componentProps: {idx, imageGallery: this.imageGallery$.value},
    });
    modal.present();
  }
}
