import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'webmapp-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  public opacity: number = 0;

  constructor() { }

  ngOnInit() {
  }

  recordMove(ev) {
    console.log('---- ~ file: register.page.ts ~ line 18 ~ RegisterPage ~ recordMove ~ ev', ev);
    this.opacity = ev;

  }
  recordStart(ev) {
    console.log('---- ~ file: register.page.ts ~ line 22 ~ RegisterPage ~ recordStart ~ ev', ev);
  }

}
