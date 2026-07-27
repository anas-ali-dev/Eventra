import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CategoriesComponent } from './categories';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
