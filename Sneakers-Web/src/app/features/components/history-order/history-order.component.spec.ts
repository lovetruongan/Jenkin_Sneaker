import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryOrderComponent } from './history-order.component';

describe('HistoryOrderComponent', () => {
  let component: HistoryOrderComponent;
  let fixture: ComponentFixture<HistoryOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
