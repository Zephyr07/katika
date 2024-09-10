import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReaperPage } from './reaper.page';

describe('ReaperPage', () => {
  let component: ReaperPage;
  let fixture: ComponentFixture<ReaperPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReaperPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
