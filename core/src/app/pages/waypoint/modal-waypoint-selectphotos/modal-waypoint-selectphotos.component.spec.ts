import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalWaypointSelectphotosComponent } from './modal-waypoint-selectphotos.component';

describe('ModalSelectphotosComponent', () => {
  let component: ModalWaypointSelectphotosComponent;
  let fixture: ComponentFixture<ModalWaypointSelectphotosComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ModalWaypointSelectphotosComponent],
        imports: [IonicModule.forRoot()],
      }).compileComponents();

      fixture = TestBed.createComponent(ModalWaypointSelectphotosComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
