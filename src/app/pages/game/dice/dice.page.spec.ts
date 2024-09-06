import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DicePage } from './dice.page';

describe('DicePage', () => {
  let component: DicePage;
  let fixture: ComponentFixture<DicePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
