import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'webmapp-btn-rec',
  templateUrl: './btn-rec.component.html',
  styleUrls: ['./btn-rec.component.scss'],
})
export class BtnRecComponent implements OnInit {
  @Output() unlocked: EventEmitter<boolean> = new EventEmitter();
  @Output() move: EventEmitter<number> = new EventEmitter();
  @ViewChild('unlock') input: any;

  public sliderPercentual = 0;
  public yetUnlocked = false;

  public rationEnd = -0.635;
  public threshold = 0.93;

  setIntID;

  private lastRatio: number;

  constructor() { }

  ngOnInit() { }

  sliding($event) {
    this.lastRatio = $event.detail.ratio;
    const percentual = this.lastRatio / this.rationEnd;
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

  changePercentual(value: number) {
    this.sliderPercentual = value;
    this.move.emit(value);
  }

  unlockAction() {
    if (!this.yetUnlocked) {
      this.unlocked.emit(true);
    }
  }


}
