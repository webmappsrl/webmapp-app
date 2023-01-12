import {ILAYER} from 'src/app/types/config';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {Store} from '@ngrx/store';
import {debounceTime} from 'rxjs/operators';
import {searchElastic, layerTracksElastic} from 'src/app/store/elastic/elastic.actions';
@Component({
  selector: 'webmapp-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  searchForm: FormGroup;
  private _currentLayer: number;
  @Output('isTypings') isTypingsEVT: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output('words') wordsEVT: EventEmitter<string> = new EventEmitter<string>(false);

  constructor(fb: FormBuilder, store: Store<IElasticSearchRootState>) {
    this.searchForm = fb.group({
      search: [''],
    });

    this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(words => {
      if (words && words.search != null && words.search !== '') {
        if (this._currentLayer != null) {
          store.dispatch(layerTracksElastic({layer: this._currentLayer, inputTyped: words}));
        } else {
          store.dispatch(searchElastic(words));
        }
        this.isTypingsEVT.emit(true);
        this.wordsEVT.emit(words.search);
      } else {
        this.isTypingsEVT.emit(false);
      }
    });
  }

  @Input('initSearch') set setSearch(init: string) {
    this.searchForm.controls.search.setValue(init);
  }

  @Input('currentLayer') set setCurrentLayer(layer: ILAYER) {
    if (layer != null && layer.id != null) {
      this._currentLayer = +layer.id;
    }
  }
  reset(): void {
    this.searchForm.reset();
    this.wordsEVT.emit('');
    this.isTypingsEVT.emit(false);
  }
}
