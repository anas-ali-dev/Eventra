import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BookingComponent } from './booking';

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
