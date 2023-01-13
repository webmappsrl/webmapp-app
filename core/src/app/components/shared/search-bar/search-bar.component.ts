import {Subscription} from 'rxjs/internal/Subscription';
import {ILAYER} from 'src/app/types/config';
import {Component, EventEmitter, Input, Output, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
import {Store} from '@ngrx/store';
import {debounceTime} from 'rxjs/operators';
import {searchElastic} from 'src/app/store/elastic/elastic.actions';
@Component({
  selector: 'webmapp-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnDestroy {
  private _currentLayer: number;
  private _searchSub$: Subscription = Subscription.EMPTY;

  @Input('currentLayer') set setCurrentLayer(layer: ILAYER) {
    if (layer != null && layer.id != null) {
      this._currentLayer = +layer.id;
    }
  }

  @Input('initSearch') set setSearch(init: string) {
    this.searchForm.controls.search.setValue(init);
  }

  @Output('isTypings') isTypingsEVT: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @Output('words') wordsEVT: EventEmitter<string> = new EventEmitter<string>(false);

  searchForm: FormGroup;

  constructor(fb: FormBuilder, store: Store<IElasticSearchRootState>) {
    this.searchForm = fb.group({
      search: [''],
    });
    /**
     * This code is subscribing to a searchForm valueChanges observable.
     * It is using the debounceTime operator to wait 500 milliseconds before emitting the value from the observable.
     * If the words and search are not null and the search is not an empty string,
     * it dispatches a searchElastic action with either the inputTyped and layer or just the inputTyped.
     * It then emits two events, one for isTypingsEVT with a boolean value of true, and one for wordsEVT
     * with the words.search as its value. If the words and search are null or an empty string,
     * it emits an event for isTypingsEVT with a boolean value of false.
     **/
    this._searchSub$ = this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(words => {
      if (words && words.search != null && words.search !== '') {
        if (this._currentLayer != null) {
          store.dispatch(searchElastic({inputTyped: words.search, layer: this._currentLayer}));
        } else {
          store.dispatch(searchElastic({inputTyped: words.search}));
        }
        this.isTypingsEVT.emit(true);
        this.wordsEVT.emit(words.search);
      } else {
        this.isTypingsEVT.emit(false);
      }
    });
  }

  /**
   * @description
   * This function is a member of a class and is used to reset the searchForm,
   * emit an empty string to the wordsEVT event, and emit false to the isTypingsEVT event.
   * @memberof SearchBarComponent
   */
  reset(): void {
    this.searchForm.reset();
    this.wordsEVT.emit('');
    this.isTypingsEVT.emit(false);
  }
  ngOnDestroy(): void {
    this._searchSub$.unsubscribe();
  }
}
