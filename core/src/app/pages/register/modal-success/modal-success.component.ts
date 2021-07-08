import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GeoutilsService } from 'src/app/services/geoutils.service';
import { Track } from 'src/app/types/track.d.';

@Component({
  selector: 'webmapp-modal-registersuccess',
  templateUrl: './modal-success.component.html',
  styleUrls: ['./modal-success.component.scss'],
})
export class ModalSuccessComponent implements OnInit {

  @Input() track: Track;
  @Input() type: string;

  trackDate;
  trackodo: number = 0;
  trackSlope: number = 0;
  trackAvgSpeed: number = 0;
  trackTopSpeed: number = 0;
  trackTime = { hours: 0, minutes: 0, seconds: 0 };

  constructor(
    private modalController: ModalController,
    private geoUtils: GeoutilsService,
  ) { }

  ngOnInit() {
    console.log('---- ~ file: modal-success.component.ts ~ line 21 ~ ModalSuccessComponent ~ ngOnInit ~ this.track', this.track);
    this.trackDate = this.geoUtils.getDate(this.track.geojson);
    this.trackodo = this.geoUtils.getLength(this.track.geojson);
    this.trackSlope = this.geoUtils.getSlope(this.track.geojson);
    this.trackAvgSpeed = this.geoUtils.getAverageSpeed(this.track.geojson);
    this.trackTopSpeed = this.geoUtils.getTopSpeed(this.track.geojson);
    this.trackTime = GeoutilsService.formatTime(this.geoUtils.getTime(this.track.geojson));
  }

  close() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

}
