import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { PaymentService, PaymentDTO, PaymentUrlResponse } from '../../../core/services/payment.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, filter, of, switchMap, takeUntil, tap } from 'rxjs';
import { InfoOrderDto } from '../../../core/dtos/InfoOrder.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    RadioButtonModule, 
    ToastModule, 
    ProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent extends BaseComponent implements OnInit {
  public paymentForm: FormGroup;
  public orderInfo!: InfoOrderDto;
  public orderId!: number;
  public loading = false;
  public paymentMethods = [
    { 
      value: 'VNPAY', 
      label: 'VNPay', 
      icon: 'pi pi-credit-card',
      description: 'Thanh toán qua VNPay (Thẻ ATM, Internet Banking, Ví điện tử)'
    },
    { 
      value: 'MOMO', 
      label: 'MoMo', 
      icon: 'pi pi-mobile',
      description: 'Thanh toán qua ví điện tử MoMo'
    },
    { 
      value: 'BANKING', 
      label: 'Chuyển khoản ngân hàng', 
      icon: 'pi pi-building',
      description: 'Chuyển khoản trực tiếp qua ngân hàng'
    },
    { 
      value: 'CASH', 
      label: 'Thanh toán khi nhận hàng', 
      icon: 'pi pi-money-bill',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng'
    }
  ];

  public selectedMethod: string = 'VNPAY';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private toastService: ToastService
  ) {
    super();
    this.paymentForm = this.fb.group({
      paymentMethod: [this.selectedMethod, Validators.required]
    });
  }

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (this.orderId) {
      this.loadOrderInfo();
    }
  }

  loadOrderInfo(): void {
    this.orderService.getOrderInfor(this.orderId).pipe(
      filter((orderInfo: InfoOrderDto) => !!orderInfo),
      tap((orderInfo: InfoOrderDto) => {
        this.orderInfo = orderInfo;
      }),
      catchError((err) => {
        this.toastService.fail('Không thể tải thông tin đơn hàng');
        this.router.navigate(['/history']);
        return of(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  onPaymentMethodChange(method: string): void {
    this.selectedMethod = method;
    this.paymentForm.patchValue({ paymentMethod: method });
  }

  // Cập nhật method processPayment trong payment.component.ts

processPayment(): void {
  if (this.paymentForm.invalid || !this.orderInfo) {
    this.toastService.fail('Vui lòng chọn phương thức thanh toán');
    return;
  }

  this.loading = true;

  const paymentDTO: PaymentDTO = {
    order_id: this.orderId,
    payment_method: this.selectedMethod,
    amount: this.orderInfo.total_money || 0,
    return_url: `${window.location.origin}/payment/result`,
    cancel_url: `${window.location.origin}/payment/cancel`,
    description: `Thanh toán đơn hàng #${this.orderId}`
  };

  this.paymentService.createPayment(paymentDTO).pipe(
    tap((response: PaymentUrlResponse) => {
      this.loading = false;
      
      if (this.selectedMethod === 'CASH') {
        this.toastService.success('Đơn hàng đã được xác nhận. Bạn sẽ thanh toán khi nhận hàng.');
        this.router.navigate(['/payment/success'], { 
          queryParams: { 
            paymentId: response.payment_id,
            method: 'CASH'
          }
        });
      } else if (this.selectedMethod === 'BANKING') {
        this.router.navigate(['/payment/banking'], { 
          queryParams: { 
            paymentId: response.payment_id,
            amount: paymentDTO.amount,
            orderId: this.orderId
          }
        });
      } else {
        // Redirect to payment gateway for VNPAY, MOMO
        console.log('Redirecting to payment URL:', response.payment_url);
        window.location.href = response.payment_url;
      }
    }),
    catchError((err) => {
      this.loading = false;
      console.error('Payment creation error:', err);
      this.toastService.fail('Có lỗi xảy ra khi tạo thanh toán');
      return of(err);
    }),
    takeUntil(this.destroyed$)
  ).subscribe();
}

  goBack(): void {
    this.router.navigate(['/order-detail', this.orderId]);
  }
}

