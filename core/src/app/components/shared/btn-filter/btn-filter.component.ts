import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import {BehaviorSubject} from 'rxjs';
import {IonModal} from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'wm-btn-filter',
  templateUrl: './btn-filter.component.html',
  styleUrls: ['./btn-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BtnFilterComponent implements OnChanges {
  @Input() filters: {[filter: string]: any[]};
  @Input() set initSelectedFilters(f: string[]) {
    if (f != null) {
      this.currentFilters$.next(f);
    }
  }
  @ViewChild('filterModal') modal: IonModal;
  @Output() selectedFilters: EventEmitter<string[]> = new EventEmitter<string[]>();

  currentFilters$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  tabs$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  isModalOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filters != null && changes.filters.currentValue != null) {
      const keys = Object.keys(this.filters);
      this.tabs$.next(keys);
      this.currentTab$.next(keys[0]);
    }
  }
  addFilter(filter: string): void {
    let currentFilters = this.currentFilters$.value;
    const indexOfFilter = currentFilters.indexOf(filter);
    if (indexOfFilter >= 0) {
      this.currentFilters$.next(currentFilters.filter(e => e !== filter));
    } else {
      this.currentFilters$.next([...this.currentFilters$.value, filter]);
    }
    this.selectedFilters.emit(this.currentFilters$.value);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
    this.isModalOpen$.next(false);
  }

  confirm() {
    this.modal.dismiss(this.currentFilters$.value, 'confirm');
  }

  onWillDismiss(event: Event) {}

  reset(): void {
    this.currentFilters$.next([]);
    this.selectedFilters.emit(this.currentFilters$.value);
    this.isModalOpen$.next(false);
  }

  segmentChanged(event: any): void {
    this.currentTab$.next(event);
  }
  setOpen(isOpen: boolean) {
    this.isModalOpen$.next(isOpen);
  }
}
