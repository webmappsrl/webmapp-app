import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'webmapp-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent implements OnInit {

  public value;

  @Input() icon: string;
  @Input() iconColor: string;
  @Input() label: string;
  @Input() secondary: string;
  @Input() placeholder: string;
  @Input() textArea: boolean = false;
  @Input() required: boolean = false;
  @Input() noline: boolean = false;
  @Input() error: string;

  @Input() validate: boolean = false;

  @Input('value') set setValue(val: any) { this.value = val; this.valueChanged() }

  @Output() valueChange = new EventEmitter<string>();

  @Output() validChange = new EventEmitter<boolean>();


  public isValid: boolean = false;

  @ViewChild('content', { read: ElementRef, static: true }) content: ElementRef;
  constructor() { }

  ngOnInit() {

  }

  hasContent() {
    return !!this.content.nativeElement.innerHTML;
  }

  valueChanged() {
    this.valueChange.emit(this.value);

    setTimeout(() => {
      this.isValid = this.required ? !!this.value : true;
      this.validChange.emit(this.isValid);
    }, 0)

  }

}
