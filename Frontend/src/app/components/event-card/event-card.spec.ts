import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventCardComponent } from './event-card';

describe('EventCardComponent', () => {

  let component: EventCardComponent;

  let fixture: ComponentFixture<EventCardComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      imports: [EventCardComponent],
      providers: [provideRouter([])]

    }).compileComponents();

    fixture = TestBed.createComponent(EventCardComponent);

    component = fixture.componentInstance;

    fixture.detectChanges();

  });

  it('should create', () => {

    expect(component).toBeTruthy();

  });

});