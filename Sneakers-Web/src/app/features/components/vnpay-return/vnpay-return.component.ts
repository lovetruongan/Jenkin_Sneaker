import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VNPayService, VNPayReturnParams } from '../../../core/services/vnpay.service';
import { ToastService } from '../../../core/services/toast.service';
import { takeUntil, tap, catchError, of } from 'rxjs';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-vnpay-return',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    CardModule,
    ButtonModule,
    ToastModule
  ],
  providers: [ToastService, MessageService],
  template: `
    <div class="vnpay-return-container">
      <p-toast></p-toast>
      
      <div class="return-content" *ngIf="!isLoading">
        <p-card [header]="paymentResult.isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'"
                [styleClass]="paymentResult.isSuccess ? 'success-card' : 'error-card'">
          
          <div class="payment-icon">
            <i [class]="paymentResult.isSuccess ? 'pi pi-check-circle success-icon' : 'pi pi-times-circle error-icon'"></i>
          </div>
          
          <div class="payment-details">
            <div class="detail-row">
              <span class="label">Mã giao dịch:</span>
              <span class="value">{{ paymentResult.txnRef }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Số tiền:</span>
              <span class="value">{{ paymentResult.amount | currency:'VND':'symbol':'1.0-0' }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Ngân hàng:</span>
              <span class="value">{{ paymentResult.bankCode }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Thời gian thanh toán:</span>
              <span class="value">{{ paymentResult.payDate | date:'dd/MM/yyyy HH:mm:ss' }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Trạng thái:</span>
              <span class="value" [class]="paymentResult.isSuccess ? 'success-text' : 'error-text'">
                {{ paymentResult.message }}
              </span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button pButton 
                    type="button" 
                    label="Về trang chủ" 
                    icon="pi pi-home"
                    class="p-button-outlined"
                    (click)="goToHome()">
            </button>
            
            <button pButton 
                    type="button" 
                    label="Xem đơn hàng" 
                    icon="pi pi-shopping-cart"
                    (click)="goToOrderDetail()"
                    *ngIf="paymentResult.isSuccess">
            </button>
          </div>
        </p-card>
      </div>
      
      <div class="loading-content" *ngIf="isLoading">
        <p-progressSpinner></p-progressSpinner>
        <p>Đang xử lý kết quả thanh toán...</p>
      </div>
    </div>
  `,
  styles: [`
    .vnpay-return-container {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .return-content {
      width: 100%;
      max-width: 600px;
    }
    
    .success-card {
      border-left: 4px solid #4caf50;
    }
    
    .error-card {
      border-left: 4px solid #f44336;
    }
    
    .payment-icon {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    
    .success-icon {
      font-size: 4rem;
      color: #4caf50;
    }
    
    .error-icon {
      font-size: 4rem;
      color: #f44336;
    }
    
    .payment-details {
      margin-bottom: 2rem;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 600;
      color: #666;
    }
    
    .value {
      font-weight: 500;
    }
    
    .success-text {
      color: #4caf50;
    }
    
    .error-text {
      color: #f44336;
    }
    
    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .loading-content {
      text-align: center;
    }
    
    .loading-content p {
      margin-top: 1rem;
      font-size: 1.1rem;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .vnpay-return-container {
        padding: 1rem;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `]
})
export class VnpayReturnComponent extends BaseComponent implements OnInit {
  isLoading = true;
  paymentResult: any = {
    isSuccess: false,
    txnRef: '',
    amount: 0,
    bankCode: '',
    payDate: '',
    message: '',
    orderId: null
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vnpayService: VNPayService,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
    this.processPaymentReturn();
  }

  private processPaymentReturn(): void {
    // Get all query parameters from the URL
    this.route.queryParams.pipe(
      tap(params => {
        console.log('VNPay return params:', params);
        
        if (this.hasRequiredParams(params)) {
          this.handlePaymentReturn(params as VNPayReturnParams);
        } else {
          this.handleInvalidReturn();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private hasRequiredParams(params: any): boolean {
    const requiredParams = ['vnp_TxnRef', 'vnp_ResponseCode', 'vnp_Amount', 'vnp_SecureHash'];
    return requiredParams.every(param => params[param]);
  }

  private handlePaymentReturn(params: VNPayReturnParams): void {
    this.vnpayService.handleReturn(params).pipe(
      tap(response => {
        console.log('VNPay return response:', response);
        
        const isValidSignature = response.isValid === 'true';
        const isSuccessfulPayment = this.vnpayService.isPaymentSuccessful(response.vnp_ResponseCode);
        
        this.paymentResult = {
          isSuccess: isValidSignature && isSuccessfulPayment,
          txnRef: response.vnp_TxnRef,
          amount: parseInt(response.vnp_Amount) / 100, // Convert back to original amount
          bankCode: response.vnp_BankCode,
          payDate: this.formatPayDate(response.vnp_PayDate),
          message: this.getResultMessage(isValidSignature, response.vnp_ResponseCode),
          orderId: this.extractOrderId(params.vnp_OrderInfo)
        };
        
        if (this.paymentResult.isSuccess) {
          this.toastService.success('Thanh toán thành công!');
          // Store order ID for navigation
          localStorage.setItem('lastOrderId', this.paymentResult.orderId?.toString() || '');
        } else {
          this.toastService.fail(this.paymentResult.message);
        }
        
        this.isLoading = false;
      }),
      catchError(error => {
        console.error('Error processing VNPay return:', error);
        this.handleErrorReturn();
        return of(error);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private handleInvalidReturn(): void {
    this.paymentResult = {
      isSuccess: false,
      message: 'Phản hồi từ VNPay không hợp lệ',
      txnRef: '',
      amount: 0,
      bankCode: '',
      payDate: '',
      orderId: null
    };
    this.isLoading = false;
    this.toastService.fail('Phản hồi thanh toán không hợp lệ');
  }

  private handleErrorReturn(): void {
    this.paymentResult = {
      isSuccess: false,
      message: 'Có lỗi xảy ra khi xử lý phản hồi thanh toán',
      txnRef: '',
      amount: 0,
      bankCode: '',
      payDate: '',
      orderId: null
    };
    this.isLoading = false;
    this.toastService.fail('Có lỗi xảy ra khi xử lý thanh toán');
  }

  private getResultMessage(isValidSignature: boolean, responseCode: string): string {
    if (!isValidSignature) {
      return 'Chữ ký phản hồi không hợp lệ';
    }
    return this.vnpayService.getPaymentStatusMessage(responseCode);
  }

  private formatPayDate(payDate: string): string {
    if (!payDate || payDate.length !== 14) return '';
    
    // Format: yyyyMMddHHmmss to Date
    const year = payDate.substring(0, 4);
    const month = payDate.substring(4, 6);
    const day = payDate.substring(6, 8);
    const hour = payDate.substring(8, 10);
    const minute = payDate.substring(10, 12);
    const second = payDate.substring(12, 14);
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  private extractOrderId(orderInfo: string): number | null {
    // Extract order ID from order info if it contains the ID
    // This depends on how you format the order info
    const match = orderInfo.match(/order[^\d]*(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToOrderDetail(): void {
    const orderId = this.paymentResult.orderId || localStorage.getItem('lastOrderId');
    if (orderId) {
      this.router.navigate([`/order-detail/${orderId}`]);
    } else {
      this.router.navigate(['/']);
    }
  }
} 