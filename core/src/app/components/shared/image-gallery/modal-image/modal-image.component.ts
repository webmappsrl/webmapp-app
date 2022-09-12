import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject, Observable, from, of} from 'rxjs';
import {IonSlides, ModalController} from '@ionic/angular';
import {beforeInit, setTransition, setTranslate} from '../utils';

@Component({
  selector: 'wm-modal-image',
  templateUrl: './modal-image.component.html',
  styleUrls: ['./modal-image.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalImageComponent implements AfterViewInit {
  @ViewChild('gallery') slider: IonSlides;
  @Input() set idx(val) {
    this.idx$.next(val);
  }
  @Input() imageGallery: any;
  slideOptions = {
    on: {
      beforeInit,
      setTranslate,
      setTransition,
    },
  };
  idx$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  getActiveIndex$: Promise<number>;
  constructor(private _modalCtrl: ModalController) {}
  closeModal(): void {
    this._modalCtrl.dismiss();
  }

  ngAfterViewInit(): void {
    this.slider.slideTo(this.idx$.value);
    this.getActiveIndex$ = Promise.resolve(this.slider.getActiveIndex());
    this.slider.ionSlideDidChange;
  }
  prev() {
    let currentIdx = this.idx$.value;
    this.idx$.next(currentIdx - 1);
    this.slider.slideTo(currentIdx - 1);
  }
  next() {
    let currentIdx = this.idx$.value;
    this.idx$.next(currentIdx + 1);
    this.slider.slideTo(currentIdx + 1);
  }
  async updateIdx() {
    const currentIdx = await this.slider.getActiveIndex();
    this.idx$.next(currentIdx);
  }
}
