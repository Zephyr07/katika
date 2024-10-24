import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuckyPage } from './lucky.page';

describe('LuckyPage', () => {
  let component: LuckyPage;
  let fixture: ComponentFixture<LuckyPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LuckyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
