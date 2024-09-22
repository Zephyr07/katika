import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromoCodePage } from './promo-code.page';

describe('PromoCodePage', () => {
  let component: PromoCodePage;
  let fixture: ComponentFixture<PromoCodePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
