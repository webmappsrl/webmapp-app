import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'webmapp-popoverphoto',
  templateUrl: './popoverphoto.component.html',
  styleUrls: ['./popoverphoto.component.scss'],
})
export class PopoverphotoComponent implements OnInit {

  constructor(
    private popoverController: PopoverController,
  ) { }

  ngOnInit() { }


  single() {
    this.popoverController.dismiss({}, 'photo');
  }

  multiple() {
    this.popoverController.dismiss({}, 'library');
  }

}
