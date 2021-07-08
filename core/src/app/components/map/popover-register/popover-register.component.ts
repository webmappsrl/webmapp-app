import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { PhotoService } from 'src/app/services/photo.service';
import { ModalphotosComponent } from '../../modalphotos/modalphotos.component';

@Component({
  selector: 'webmapp-popover-register',
  templateUrl: './popover-register.component.html',
  styleUrls: ['./popover-register.component.scss'],
})
export class PopoverRegisterComponent implements OnInit {

  public registering: boolean;

  constructor(
    private popoverController: PopoverController,
    private navCtrl: NavController,
    private photoService: PhotoService,
    private _modalController: ModalController
  ) { }

  ngOnInit() {
  }

  track() {
    this.navCtrl.navigateForward('register');
    this.dismiss();
  }

  async photo() {
    console.log('---- ~ file: popover-register.component.ts ~ line 20 ~ PopoverRegisterComponent ~ photo ~ photo');

    this.dismiss();

    const image = await this.photoService.shotPhoto();

    const modalPhotos = await this._modalController.create({
      component: ModalphotosComponent,
      componentProps: {
        photo: image
      }
    });
    await modalPhotos.present();

    // Can be set to the src of an image now
    // imageElement.src = imageUrl;
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
