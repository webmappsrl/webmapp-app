import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalSuccessComponent } from 'src/app/components/modal-success/modal-success.component';
import { SaveService } from 'src/app/services/save.service';
import { ILocation } from 'src/app/types/location';
import { SuccessType } from 'src/app/types/esuccess.enum';
import { WaypointSave } from 'src/app/types/waypoint';

@Component({
  selector: 'webmapp-modal-waypoint-save',
  templateUrl: './modal-waypoint-save.component.html',
  styleUrls: ['./modal-waypoint-save.component.scss'],
})
export class ModalWaypointSaveComponent implements OnInit {
  public position: ILocation;
  public displayPosition: ILocation;
  public title: string;
  public description: string;
  public waypointtype: string;

  public positionString: string;
  public positionCity: string = 'città';

  constructor(
    private modalController: ModalController,
    private saveService: SaveService
  ) {}

  ngOnInit() {
    console.log(
      '------- ~ line 18 ~ ModalWaypointSaveComponent ~ ngOnInit ~ this.position',
      this.position
    );
    this.positionString = `${this.position.latitude}, ${this.position.longitude}`;
    setTimeout(() => {
      this.displayPosition = this.position;
    }, 2000);
  }

  async save() {
    const waypoint: WaypointSave = {
      position: this.position,
      displayPosition: this.displayPosition,
      title: this.title,
      description: this.description,
      waypointtype: this.waypointtype,
      city: this.positionCity,
    };

    await this.saveService.saveWaypoint(waypoint);

    this.modalController.dismiss();

    await this.openModalSuccess(waypoint);
  }

  async openModalSuccess(waypoint) {
    const modaSuccess = await this.modalController.create({
      component: ModalSuccessComponent,
      componentProps: {
        type: SuccessType.WAYPOINT,
        waypoint,
      },
    });
    await modaSuccess.present();
    await modaSuccess.onDidDismiss();
  }

  isValid() {
    return this.title && this.waypointtype;
  }
}
