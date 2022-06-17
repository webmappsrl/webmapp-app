import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {debounceTime} from 'rxjs/operators';
import {searchElastic} from 'src/app/store/elastic/elastic.actions';
import {IElasticSearchRootState} from 'src/app/store/elastic/elastic.reducer';
@Component({
  selector: 'webmapp-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  searchForm: FormGroup;
  @Output('words') wordsEVT: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  constructor(fb: FormBuilder, store: Store<IElasticSearchRootState>) {
    this.searchForm = fb.group({
      search: [''],
    });

    this.searchForm.valueChanges.pipe(debounceTime(500)).subscribe(words => {
      if (words && words.search != null && words.search !== '') {
        store.dispatch(searchElastic(words));
        this.wordsEVT.emit(true);
      } else {
        this.wordsEVT.emit(false);
      }
    });
  }

  @Input('initSearch') set setSearch(init: string) {
    this.searchForm.controls.search.setValue(init);
  }

  reset(): void {
    this.searchForm.controls.search.setValue('');
    this.wordsEVT.emit(false);
  }
}
