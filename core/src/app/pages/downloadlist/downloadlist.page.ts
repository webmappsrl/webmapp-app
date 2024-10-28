import {AlertController, NavController} from '@ionic/angular';
import {Component, OnInit} from '@angular/core';

import {NavigationExtras, Router} from '@angular/router';
import {LangService} from 'wm-core/localization/lang.service';
import {GeoJSONFeature} from 'ol/format/GeoJSON';
import {getEcTracks, removeTrack} from 'wm-core/utils/localForage';

@Component({
  selector: 'app-downloadlist',
  templateUrl: './downloadlist.page.html',
  styleUrls: ['./downloadlist.page.scss'],
})
export class DownloadlistPage implements OnInit {
  public isSelectedActive = false;
  public selected: GeoJSONFeature[] = [];
  public tracks: GeoJSONFeature[] = [];

  constructor(
    private _navCtrl: NavController,
    private _router: Router,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
  ) {}

  async ngOnInit() {
    this.tracks = await getEcTracks();
  }

  async deleteSelected() {
    const alert = await this._alertCtrl.create({
      header: this._langSvc.instant('Attenzione'),
      message: this._langSvc.instant('Sei sicuro di voler eliminare le tracce?'),
      buttons: [
        this._langSvc.instant('Annulla'),
        {
          text: this._langSvc.instant('Elimina'),
          handler: () => {
            this.selected.forEach(track => {
              removeTrack(`${track.properties.id}`);
            });
            this.isSelectedActive = false;
          },
        },
      ],
    });
    alert.present().then();
  }

  gotoMap(): void {
    this._navCtrl.navigateRoot('/map', {replaceUrl: true});
  }

  open(track: GeoJSONFeature): void {
    const clickedFeatureId = track.properties.id;
    if (clickedFeatureId != null) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          track: clickedFeatureId,
        },
      };
      this._router.navigate(['map'], navigationExtras);
    }
  }

  async remove(track: GeoJSONFeature) {
    const alert = await this._alertCtrl.create({
      header: this._langSvc.instant('Attenzione'),
      message: this._langSvc.instant('Sei sicuro di voler eliminare la traccia?'),
      buttons: [
        this._langSvc.instant('Annulla'),
        {
          text: this._langSvc.instant('Elimina'),
          handler: () => {
            this._remove(track);
          },
        },
      ],
    });
    alert.present().then();
  }

  select(ev, track): void {
    if (ev.detail.checked) {
      this.selected.push(track);
    } else {
      this.selected.splice(this.selected.indexOf(track), 1);
    }
  }

  private async _remove(track: GeoJSONFeature) {
    await removeTrack(`${track.properties.id}`);
    const idx = this.tracks.findIndex(x => x.properties.id == track.properties.id);
    this.tracks.splice(idx, 1);
  }
}
