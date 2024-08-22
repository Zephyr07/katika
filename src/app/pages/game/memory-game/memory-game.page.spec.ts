import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemoryGamePage } from './memory-game.page';

describe('MemoryGamePage', () => {
  let component: MemoryGamePage;
  let fixture: ComponentFixture<MemoryGamePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MemoryGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
