import { TestBed } from '@angular/core/testing';

import { GeoutilsService } from './geoutils.service';

describe('GeoutilsService', () => {
  let service: GeoutilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoutilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
