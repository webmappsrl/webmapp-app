import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-coins',
  templateUrl: './modal-coins.component.html',
  styleUrls: ['./modal-coins.component.scss'],
})
export class ModalCoinsComponent implements OnInit {

  public message: string;
  public coins: number;

  constructor() { }

  ngOnInit() { }

  buyone() {
    console.log("------- ~ ModalCoinsComponent ~ buyone ~ buyone");

  }

}
