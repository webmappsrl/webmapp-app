import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CGeojsonLineStringFeature } from 'src/app/classes/features/cgeojson-line-string-feature';
import { GeohubService } from 'src/app/services/geohub.service';
import { Animation, AnimationController, Platform } from '@ionic/angular';
import { DownloadService } from 'src/app/services/download.service';

@Component({
  selector: 'webmapp-map-track-card',
  templateUrl: './map-track-card.component.html',
  styleUrls: ['./map-track-card.component.scss'],
})
export class MapTrackCardComponent implements OnInit {


  @Input('track') track: CGeojsonLineStringFeature;

  @Output() close = new EventEmitter();
  @Output() openClick = new EventEmitter();

  @ViewChild('favouriteanimation') favouriteanimation: ElementRef;

  public isFavourite: boolean;

  public image;

  private animation?: Animation;



  constructor(
    private _geohubService: GeohubService,
    private animationCtrl: AnimationController,
    private _platform: Platform,
    private download:DownloadService
  ) { }

  async ngOnInit() {

    this.isFavourite = await this._geohubService.isFavouriteTrack(this.track.properties.id);
    
    let src = this.track.properties?.feature_image?.sizes['108x137'] || this.track.properties?.feature_image?.url;
    this.image = await this.download.getB64img(src)

    await this._platform.ready();
    // console.log('------- ~ file: map-track-card.component.ts ~ line 29 ~ MapTrackCardComponent ~ ngOnInit ~ this.favouriteanimation', this.favouriteanimation);

    this.animation = this.animationCtrl.create()
      .duration(1000)
      .addElement(this.favouriteanimation.nativeElement)
      .fromTo(
        'opacity',
        '1',
        '0')
      .fromTo(
        'transform',
        'scale(0.5,0.5)',
        'scale(2,2)')
  }

  async setFavourite() {
    this.animation.play();
    this.isFavourite = await this._geohubService.setFavouriteTrack(this.track.properties.id, !this.isFavourite);
    
  }

  exit() {
    this.close.emit()
  }

  open() {
    this.openClick.emit()
  }

}
