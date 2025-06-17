import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService, PaymentStatusResponse } from '../../../core/services/payment.service';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { catchError, of, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, RouterModule],
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.scss']
})
export class PaymentResultComponent extends BaseComponent implements OnInit {
  public paymentStatus!: PaymentStatusResponse;
  public loading = true;
  public isSuccess = false;
  formatPaymentMethod(method: string): string {
    switch(method) {
      case 'momo': return 'MoMo';
      case 'banking': return 'Chuyển khoản';
      default: return method;
    }
}

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(
      tap(params => {
        if (params['payment_id']) {
          this.checkPaymentStatus(params['payment_id']);
        } else {
          this.loading = false;
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  checkPaymentStatus(paymentId: number): void {
    this.paymentService.getPaymentStatus(paymentId).pipe(
      tap((status: PaymentStatusResponse) => {
        this.paymentStatus = status;
        this.isSuccess = status.is_success;
        this.loading = false;
      }),
      catchError(err => {
        this.loading = false;
        return of(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  goToOrderDetail(): void {
    if (this.paymentStatus) {
      this.router.navigate(['/order-detail', this.paymentStatus.order_id]);
    }
  }

  goToHome(): void {
    this.router.navigate(['/Home']);
  }

  goToHistory(): void {
    this.router.navigate(['/history']);
  }
}