import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverPhotoType } from 'src/app/types/esuccess.enum';

@Component({
  selector: 'webmapp-popoverphoto',
  templateUrl: './popoverphoto.component.html',
  styleUrls: ['./popoverphoto.component.scss'],
})
export class PopoverphotoComponent implements OnInit {
  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}

  single() {
    this.popoverController.dismiss({}, PopoverPhotoType.PHOTOS);
  }

  multiple() {
    this.popoverController.dismiss({}, PopoverPhotoType.LIBRARY);
  }
}
