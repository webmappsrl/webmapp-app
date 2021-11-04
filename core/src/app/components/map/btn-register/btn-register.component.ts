import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverRegisterComponent } from '../popover-register/popover-register.component';

@Component({
  selector: 'webmapp-btn-register',
  templateUrl: './btn-register.component.html',
  styleUrls: ['./btn-register.component.scss'],
})
export class BtnRegisterComponent implements OnInit {
  @Input('color') color: string = 'primary';
  @Input('registering') registering: boolean = false;

  public isPopOverPresented = false;

  private popover: HTMLIonPopoverElement;

  constructor(public popoverController: PopoverController) {}

  ngOnInit() {}

  async presentPopOver(ev: any) {
    this.popover = await this.popoverController.create({
      component: PopoverRegisterComponent,
      cssClass: 'popover-register',
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: { registering: this.registering },
    });
    await this.popover.present();
    this.isPopOverPresented = true;
    const { role } = await this.popover.onDidDismiss();
    this.isPopOverPresented = false;
  }
}
