import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedAccountPage } from './activated-account.page';

describe('ActivatedAccountPage', () => {
  let component: ActivatedAccountPage;
  let fixture: ComponentFixture<ActivatedAccountPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ActivatedAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
