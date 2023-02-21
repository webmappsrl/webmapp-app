import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'wm-search-list',
  templateUrl: './search-list.component.html',
  styleUrls: ['./search-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SearchListComponent implements OnChanges {
  @Input() set currentTab(tab: string) {
    this.currentTab$.next(tab);
  }

  @Input() cards: IHIT[];
  @Input() pois: any[];
  @Output() selectedPoiEvt: EventEmitter<string | number> = new EventEmitter();
  @Output() selectedTrackEvt: EventEmitter<string | number> = new EventEmitter();

  currentTab$: BehaviorSubject<string> = new BehaviorSubject<string>('tracks');

  segmentChanged(evt: any): void {
    this.currentTab$.next(evt.detail.value);
  }

  selectPoi(id: string | number): void {
    this.selectedPoiEvt.emit(id);
  }

  selectTrack(id: string | number): void {
    this.selectedTrackEvt.emit(id);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.pois != null &&
      this.pois.length > 0 &&
      this.cards != null &&
      this.cards.length === 0
    ) {
      this.currentTab$.next('pois');
    }
    if (
      this.pois != null &&
      this.pois.length === 0 &&
      this.cards != null &&
      this.cards.length > 0
    ) {
      this.currentTab$.next('tracks');
    }
  }
}
