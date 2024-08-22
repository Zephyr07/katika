import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AviatorPage } from './aviator.page';

describe('AviatorPage', () => {
  let component: AviatorPage;
  let fixture: ComponentFixture<AviatorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AviatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
