import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FortunePage } from './fortune.page';

describe('FortunePage', () => {
  let component: FortunePage;
  let fixture: ComponentFixture<FortunePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FortunePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
