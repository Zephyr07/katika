import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiplicatorPage } from './multiplicator.page';

describe('MultiplicatorPage', () => {
  let component: MultiplicatorPage;
  let fixture: ComponentFixture<MultiplicatorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiplicatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
