import {ChangeDetectionStrategy, Component} from '@angular/core';

import {DomSanitizer} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {confPROJECT} from 'src/app/store/conf/conf.selector';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPage {
  innerHtml$ = this._store.select(confPROJECT);

  constructor(private _store: Store, public sanitizer: DomSanitizer) {}
}
