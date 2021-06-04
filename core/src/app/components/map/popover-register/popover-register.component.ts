import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'webmapp-popover-register',
  templateUrl: './popover-register.component.html',
  styleUrls: ['./popover-register.component.scss'],
})
export class PopoverRegisterComponent implements OnInit {

  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }

  track() {
    console.log('---- ~ file: popover-register.component.ts ~ line 15 ~ PopoverRegisterComponent ~ track ~ track');
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
