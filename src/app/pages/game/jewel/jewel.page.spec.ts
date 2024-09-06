import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JewelPage } from './jewel.page';

describe('JewelPage', () => {
  let component: JewelPage;
  let fixture: ComponentFixture<JewelPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JewelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
