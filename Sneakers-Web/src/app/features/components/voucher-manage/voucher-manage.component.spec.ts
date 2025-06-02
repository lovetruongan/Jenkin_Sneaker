import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherManageComponent } from './voucher-manage.component';

describe('VoucherManageComponent', () => {
  let component: VoucherManageComponent;
  let fixture: ComponentFixture<VoucherManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 