import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { PaymentService, PaymentResponse } from '../../../core/services/payment.service';
import { catchError, filter, of, takeUntil, tap } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TagModule],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent extends BaseComponent implements OnInit {
  public payments: PaymentResponse[] = [];
  public loading = false;

  constructor(
    private paymentService: PaymentService,
    private toastService: ToastService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadPaymentHistory();
  }

  loadPaymentHistory(): void {
    this.loading = true;
    this.paymentService.getPaymentsByUser().pipe(
      filter((payments: PaymentResponse[]) => !!payments),
      tap((payments: PaymentResponse[]) => {
        this.payments = payments;
        this.loading = false;
      }),
      catchError(err => {
        this.loading = false;
        this.toastService.fail('Không thể tải lịch sử thanh toán');
        return of(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/order-detail', orderId]);
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    return this.paymentService.getStatusSeverity(status);
  }

  formatPaymentStatus(status: string): string {
    return this.paymentService.formatPaymentStatus(status);
  }

  formatPaymentMethod(method: string): string {
    return this.paymentService.formatPaymentMethod(method);
  }

  getPaymentMethodIcon(method: string): string {
    return this.paymentService.getPaymentMethodIcon(method);
  }

  cancelPayment(paymentId: number): void {
    const reason = 'Người dùng hủy thanh toán';
    this.paymentService.cancelPayment(paymentId, reason).pipe(
      tap(() => {
        this.toastService.success('Đã hủy thanh toán thành công');
        this.loadPaymentHistory();
      }),
      catchError(err => {
        this.toastService.fail('Không thể hủy thanh toán');
        return of(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  canCancelPayment(payment: PaymentResponse): boolean {
    return payment.payment_status === 'PENDING';
  }
}