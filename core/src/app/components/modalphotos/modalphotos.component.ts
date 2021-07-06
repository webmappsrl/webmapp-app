import { Component, Input, OnInit } from '@angular/core';
import { CameraPhoto } from '@capacitor/core';

@Component({
  selector: 'webmapp-modalphotos',
  templateUrl: './modalphotos.component.html',
  styleUrls: ['./modalphotos.component.scss'],
})
export class ModalphotosComponent implements OnInit {

  public photo: CameraPhoto;
  public src: string;

  constructor() { }

  ngOnInit() {
    this.src = this.photo.webPath;
    console.log('------- ~ file: modalphotos.component.ts ~ line 20 ~ ModalphotosComponent ~ photo', this.photo);
  }

}
