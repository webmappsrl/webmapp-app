import { TestBed } from '@angular/core/testing';

import { LanguagesService } from './languages.service';

xdescribe('TranslateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LanguagesService = TestBed.get(LanguagesService);
    expect(service).toBeTruthy();
  });
});
