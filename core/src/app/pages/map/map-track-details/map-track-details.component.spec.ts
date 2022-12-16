import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapTrackDetailsComponent } from './map-track-details.component';

describe('MapTrackDetailsComponent', () => {
  let component: MapTrackDetailsComponent;
  let fixture: ComponentFixture<MapTrackDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapTrackDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapTrackDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
