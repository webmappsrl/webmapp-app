import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'wm-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SearchListComponent {
  currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>('tracks');
  @Input() cards: IHIT[];
  @Input() pois: any[];
  @Input() set currentTab(tab: string) {
    this.currentTab$.next(tab);
  }
  @Output() selectedTrackEvt: EventEmitter<string | number> = new EventEmitter();
  @Output() selectedPoiEvt: EventEmitter<string | number> = new EventEmitter();
  constructor() {}

  segmentChanged(evt: any): void {
    this.currentTab$.next(evt.detail.value);
  }

  selectTrack(id: string | number): void {
    this.selectedTrackEvt.emit(id);
  }

  selectPoi(id: string | number): void {
    this.selectedPoiEvt.emit(id);
  }
}
