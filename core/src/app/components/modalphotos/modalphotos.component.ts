import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'webmapp-modalphotos',
  templateUrl: './modalphotos.component.html',
  styleUrls: ['./modalphotos.component.scss'],
})
export class ModalphotosComponent implements OnInit {

  @Input('photoUrl') photoUrl: string;

  constructor() { }

  ngOnInit() { }

}
