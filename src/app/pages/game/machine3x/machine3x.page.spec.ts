import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Machine3xPage } from './machine3x.page';

describe('Machine3xPage', () => {
  let component: Machine3xPage;
  let fixture: ComponentFixture<Machine3xPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Machine3xPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
