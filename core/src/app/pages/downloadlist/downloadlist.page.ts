import {AlertController, NavController} from '@ionic/angular';
import {Component, OnInit} from '@angular/core';
import {LineString} from 'geojson';
import {LangService} from '@wm-core/localization/lang.service';
import {getEcTracks, removeEcTrack} from '@wm-core/utils/localForage';
import {UrlHandlerService} from '@wm-core/services/url-handler.service';
import {WmFeature} from '@wm-types/feature';

@Component({
  selector: 'app-downloadlist',
  templateUrl: './downloadlist.page.html',
  styleUrls: ['./downloadlist.page.scss'],
})
export class DownloadlistPage implements OnInit {
  public isSelectedActive = false;
  public selected: WmFeature<LineString>[] = [];
  public tracks: WmFeature<LineString>[] = [];

  constructor(
    private _navCtrl: NavController,
    private _alertCtrl: AlertController,
    private _langSvc: LangService,
    private _urlHandlerSvc: UrlHandlerService,
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
              removeEcTrack(`${track.properties.id}`);
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

  open(track: WmFeature<LineString>): void {
    const clickedFeatureId = track.properties.id ?? null;
    this._urlHandlerSvc.updateURL({
      track: clickedFeatureId,
    }, ['map']);
  }

  async remove(track: WmFeature<LineString>) {
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

  private async _remove(track: WmFeature<LineString>) {
    await removeEcTrack(`${track.properties.id}`);
    const idx = this.tracks.findIndex(x => x.properties.id == track.properties.id);
    this.tracks.splice(idx, 1);
  }
}
