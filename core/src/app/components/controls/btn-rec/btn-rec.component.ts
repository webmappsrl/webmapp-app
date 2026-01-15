import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
  standalone: false,
  selector: 'wm-btn-rec',
  templateUrl: './btn-rec.component.html',
  styleUrls: ['./btn-rec.component.scss'],
})
export class BtnRecComponent {
  private _lastRatio: number;

  @Output() move: EventEmitter<number> = new EventEmitter();
  @Output() unlocked: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('unlock') input: any;

  rationEnd = -0.635;
  setIntID;
  sliderPercentual = 0;
  threshold = 0.93;
  yetUnlocked = false;
  showBtn$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  constructor() {}

  changePercentual(value: number) {
    this.sliderPercentual = value;
    this.move.emit(value);
  }

  sliding($event) {
    this._lastRatio = $event.detail.ratio;
    const percentual = this._lastRatio / this.rationEnd;
    if (percentual >= 1) {
      this.unlockAction();
    }
    this.changePercentual(percentual);
  }

  touchEnd() {
    if (this.sliderPercentual > this.threshold) {
      this.unlockAction();
    } else {
      this.changePercentual(0);
    }
  }

  unlockAction() {
    if (!this.yetUnlocked) {
      this.unlocked.emit(true);
    }
    this.showBtn$.next(false);
  }
}
