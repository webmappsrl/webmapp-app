import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'wm-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WmFormComponent {
  @Input() set confPOIFORMS(forms: any[]) {
    this.forms$.next(forms);
    this.setForm();
  }
  @Input() disabled = false;

  @Input() set init(values) {
    if (values != null) {
      this.setForm(values.index, values);
    }
  }
  @Input() set formId(id: any) {
    this.setForm(id, this.forms$.value[id]);
  }

  get formId() {
    return this._currentFormId;
  }

  currentForm$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Output() formGroupEvt: EventEmitter<UntypedFormGroup> = new EventEmitter<UntypedFormGroup>();
  formGroup: UntypedFormGroup;
  forms$: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);
  private _currentFormId = 0;
  constructor(private _fb: UntypedFormBuilder) {}

  setForm(idx = 0, values?: any): void {
    this._currentFormId = idx;
    this.currentForm$.next(this.forms$.value[idx]);
    let formObj = {};
    this.currentForm$.value.fields.forEach(field => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'text') {
        formObj[field.name] = [
          values && values[field.name] ? values[field.name] : null,
          validators,
        ];
      }
      if (field.type === 'textarea') {
        formObj[field.name] = [values && values[field.name] ? values[field.name] : '', validators];
      }
      if (field.type === 'select') {
        formObj[field.name] = [
          values && values[field.name] ? values[field.name] : field.values[0].value,
          validators,
        ];
      }
      formObj['index'] = idx;
      formObj['id'] = this.currentForm$.value.id;
      this.formGroup = this._fb.group(formObj);
      this.formGroupEvt.emit(this.formGroup);
    });
  }
}
