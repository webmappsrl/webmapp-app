import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, PopoverController } from '@ionic/angular';
import { Camera, CameraResultType } from '@capacitor/core';
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

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

    // // image.webPath will contain a path that can be set as an image src.
    // // You can access the original file using image.path, which can be
    // // passed to the Filesystem API to read the raw data of the image,
    // // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    // const imageUrl = image.webPath;
    
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
