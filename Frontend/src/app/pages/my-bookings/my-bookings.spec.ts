import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MyBookingsComponent } from './my-bookings';

describe('MyBookingsComponent', () => {
  let component: MyBookingsComponent;
  let fixture: ComponentFixture<MyBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBookingsComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MyBookingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
