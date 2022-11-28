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

import {IHOME, ILAYER} from 'src/app/types/config';

@Component({
  selector: 'wm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnChanges {
  @Input() conf: IHOME[];
  @Output() openSlugEvt: EventEmitter<string> = new EventEmitter();
  @Output() selectedLayerEvt: EventEmitter<ILAYER | null | number> = new EventEmitter();
  @Output() selectedTrackEvt: EventEmitter<string | number> = new EventEmitter();

  openSlug(slug: string): void {
    this.openSlugEvt.emit(slug);
  }

  selectLayer(layer: ILAYER | null | number): void {
    this.selectedLayerEvt.emit(layer);
  }

  selectTrack(id: string | number): void {
    this.selectedTrackEvt.emit(id);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }
}
