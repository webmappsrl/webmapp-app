import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'webmapp-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent implements OnInit {

  @Input() icon: string;
  @Input() iconColor: string;
  @Input() label: string;
  @Input() secondary: string;
  @Input() textArea: boolean = false;
  @Input() required: boolean = false;
  @Input() error: string;

  @Input() validate: boolean = false;

  @Input() value: string;
  @Output() valueChange = new EventEmitter<string>();


  @Output() validChange = new EventEmitter<boolean>();

  public isValid: boolean = false;

  constructor() { }

  ngOnInit() { }

  valueChanged() {
    this.valueChange.emit(this.value);

    this.isValid=this.required?!!this.value:true;

    this.validChange.emit(this.isValid);
  }

}
