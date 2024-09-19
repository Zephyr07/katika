import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlusmoinsPage } from './plusmoins.page';

describe('PlusmoinsPage', () => {
  let component: PlusmoinsPage;
  let fixture: ComponentFixture<PlusmoinsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlusmoinsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
