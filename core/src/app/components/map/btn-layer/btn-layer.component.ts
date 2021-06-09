import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'webmapp-btn-layer',
  templateUrl: './btn-layer.component.html',
  styleUrls: ['./btn-layer.component.scss'],
})
export class BtnLayerComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  selectLayers(ev) {
    console.log('---- ~ file: btn-layer.component.ts ~ line 15 ~ BtnLayerComponent ~ selectLayers ~ ev', ev);
  }

}
