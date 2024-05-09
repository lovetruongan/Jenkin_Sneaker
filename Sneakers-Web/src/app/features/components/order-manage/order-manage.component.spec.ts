import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderManageComponent } from './order-manage.component';

describe('OrderManageComponent', () => {
  let component: OrderManageComponent;
  let fixture: ComponentFixture<OrderManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderManageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
