import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'webmapp-popover-register',
  templateUrl: './popover-register.component.html',
  styleUrls: ['./popover-register.component.scss'],
})
export class PopoverRegisterComponent implements OnInit {

  public registering: boolean;

  constructor(
    private popoverController: PopoverController,
    private  navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  track() {
    this.navCtrl.navigateForward('register');
    this.dismiss();
  }

  photo() {
    console.log('---- ~ file: popover-register.component.ts ~ line 20 ~ PopoverRegisterComponent ~ photo ~ photo');
    this.dismiss();
  }

  waypoint() {
    console.log('---- ~ file: popover-register.component.ts ~ line 25 ~ PopoverRegisterComponent ~ waypoint ~ waypoint');
    this.dismiss();
  }

  vocal() {
    console.log('---- ~ file: popover-register.component.ts ~ line 30 ~ PopoverRegisterComponent ~ vocal ~ vocal');
    this.dismiss();
  }

  dismiss() {
      this.popoverController.dismiss();
  }


}
