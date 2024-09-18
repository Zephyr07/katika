import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Machine5xPage } from './machine5x.page';

describe('Machine5xPage', () => {
  let component: Machine5xPage;
  let fixture: ComponentFixture<Machine5xPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Machine5xPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
