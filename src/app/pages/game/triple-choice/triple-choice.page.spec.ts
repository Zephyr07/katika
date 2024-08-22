import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripleChoicePage } from './triple-choice.page';

describe('TripleChoicePage', () => {
  let component: TripleChoicePage;
  let fixture: ComponentFixture<TripleChoicePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TripleChoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
