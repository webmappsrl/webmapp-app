import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  ViewEncapsulation,
  EventEmitter,
} from '@angular/core';
import {IHOME, ILAYER} from 'src/app/types/config';

@Component({
  selector: 'wm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  constructor() {}
  @Input() conf: IHOME[];
  @Output() selectedLayerEvt: EventEmitter<ILAYER | null | number> = new EventEmitter();
  @Output() selectedTrackEvt: EventEmitter<string | number> = new EventEmitter();
  @Output() openSlugEvt: EventEmitter<string> = new EventEmitter();
  selectLayer(layer: ILAYER | null | number): void {
    this.selectedLayerEvt.emit(layer);
  }
  openSlug(slug: string): void {
    this.openSlugEvt.emit(slug);
  }
  selectTrack(id: string | number): void {
    this.selectedTrackEvt.emit(id);
  }
}
