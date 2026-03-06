import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {GeohubService} from 'src/app/services/geohub.service';
import {Animation, AnimationController, Platform} from '@ionic/angular';
import {Feature, LineString} from 'geojson';
@Component({
  standalone: false,
  selector: 'webmapp-map-track-card',
  templateUrl: './map-track-card.component.html',
  styleUrls: ['./map-track-card.component.scss'],
})
export class MapTrackCardComponent implements OnInit {
  private animation?: Animation;

  @Input('track') track: Feature<LineString>;
  @Output() close = new EventEmitter();
  @Output() openClick = new EventEmitter();
  @ViewChild('favouriteanimation') favouriteanimation: ElementRef;

  public isFavourite: boolean;

  constructor(
    private _geohubService: GeohubService,
    private animationCtrl: AnimationController,
    private _platform: Platform,
  ) {}

  async ngOnInit() {
    this.isFavourite = await this._geohubService.isFavouriteTrack(this.track.properties.id);

    await this._platform.ready();

    this.animation = this.animationCtrl
      .create()
      .duration(1000)
      .addElement(this.favouriteanimation.nativeElement)
      .fromTo('opacity', '1', '0')
      .fromTo('transform', 'scale(0.5,0.5)', 'scale(2,2)');
  }

  exit() {
    this.close.emit();
  }

  open() {
    this.openClick.emit();
  }

  async setFavourite() {
    this.animation.play();
    this.isFavourite = await this._geohubService.setFavouriteTrack(
      this.track.properties.id,
      !this.isFavourite,
    );
  }
}
