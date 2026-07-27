import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventsComponent } from './events';

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
