import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IonSlides, ModalController} from '@ionic/angular';
import {StorageService} from 'src/app/services/base/storage.service';
import {beforeInit, setTransition, setTranslate} from '../utils';

@Component({
  selector: 'wm-modal-image',
  templateUrl: './modal-image.component.html',
  styleUrls: ['./modal-image.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalImageComponent implements AfterViewInit {
  @Input() set idx(val) {
    this.idx$.next(val);
  }

  @Input() imageGallery: any;
  @ViewChild('gallery') slider: IonSlides;

  getActiveIndex$: Promise<number>;
  getStorageImage = (url: string) => {
    return this._storageSvc.getImage(url) as Promise<any>;
  };
  idx$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  slideOptions = {
    on: {
      beforeInit,
      setTranslate,
      setTransition,
    },
  };

  constructor(private _modalCtrl: ModalController, private _storageSvc: StorageService) {}

  closeModal(): void {
    this._modalCtrl.dismiss();
  }

  next(): void {
    let currentIdx = this.idx$.value;
    this.idx$.next(currentIdx + 1);
    this.slider.slideTo(currentIdx + 1);
  }

  ngAfterViewInit(): void {
    this.slider.slideTo(this.idx$.value);
    this.getActiveIndex$ = Promise.resolve(this.slider.getActiveIndex());
    this.slider.ionSlideDidChange;
  }

  prev(): void {
    let currentIdx = this.idx$.value;
    this.idx$.next(currentIdx - 1);
    this.slider.slideTo(currentIdx - 1);
  }

  async updateIdx(): Promise<void> {
    const currentIdx = await this.slider.getActiveIndex();
    this.idx$.next(currentIdx);
  }
}
