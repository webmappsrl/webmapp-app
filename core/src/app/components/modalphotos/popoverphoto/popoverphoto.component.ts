import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { EPopoverPhotoType } from 'src/app/types/esuccess.enum';

@Component({
  selector: 'webmapp-popoverphoto',
  templateUrl: './popoverphoto.component.html',
  styleUrls: ['./popoverphoto.component.scss'],
})
export class PopoverphotoComponent implements OnInit {
  constructor(private _popoverController: PopoverController) {}

  ngOnInit() {}

  single() {
    this._popoverController.dismiss({}, EPopoverPhotoType.PHOTOS);
  }

  multiple() {
    this._popoverController.dismiss({}, EPopoverPhotoType.LIBRARY);
  }
}
