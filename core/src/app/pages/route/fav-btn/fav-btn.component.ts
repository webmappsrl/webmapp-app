import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Animation, AnimationController, AnimationDirection, Platform } from '@ionic/angular';

@Component({
  selector: 'webmapp-fav-btn',
  templateUrl: './fav-btn.component.html',
  styleUrls: ['./fav-btn.component.scss'],
})
export class FavBtnComponent implements OnInit {

  @Input('isFavourite') isFavourite: boolean;

  @ViewChild('left') leftControl: ElementRef;
  @ViewChild('center') centerControl: ElementRef;
  @ViewChild('text') textControl: ElementRef;

  private centerWidth = 120;
  private animation?: Animation;
  private isAnimating = false;

  constructor(
    private animationCtrl: AnimationController,
    private _platform: Platform,) { }

  async ngOnInit() {
    await this._platform.ready();

    const animationLeft = this.animationCtrl.create()
      .addElement(this.leftControl.nativeElement)
      .fromTo(
        'transform',
        'translateX(0px)',
        `translateX(-${this.centerWidth}px)`)
    const animationCenter = this.animationCtrl.create()
      .addElement(this.centerControl.nativeElement)
      .fromTo(
        'transform',
        'scaleX(0) ',
        `scaleX(1) `)
    const animationText = this.animationCtrl.create()
      .addElement(this.textControl.nativeElement)
      .fromTo(
        'opacity',
        '0',
        `1`)

    this.animation = this.animationCtrl.create()
      .duration(600)
      .addAnimation([animationLeft, animationCenter, animationText]);
  }

  async click() {
    if(this.isAnimating){
      return;
    }
    this.isAnimating = true;
    this.isFavourite = !this.isFavourite;
    this.animation.direction('normal' )
    await this.animation.play();
    await new Promise(r => setTimeout(r, 1500)); 
    this.animation.direction('reverse')
    await this.animation.play();
    this.isAnimating = false;
  }

}
