import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { StripeService, StripePaymentRequest } from '../../../core/services/stripe.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    MessagesModule
  ],
  providers: [ToastService],
  template: `
    <div class="stripe-payment-container">
      <div class="card-header">
        <h3>Thanh toán bằng thẻ Visa/Mastercard</h3>
        <p class="text-muted">Nhập thông tin thẻ của bạn để thanh toán</p>
      </div>

      <div class="payment-form">
        <!-- Card Element Container -->
        <div class="form-group">
          <label for="card-element">
            Thông tin thẻ tín dụng hoặc thẻ ghi nợ
          </label>
          <div #cardElement id="card-element" class="stripe-card-element">
            <!-- Stripe Elements will create form elements here -->
          </div>
          
          <!-- Error messages -->
          <div #cardErrors id="card-errors" role="alert" class="stripe-error"></div>
        </div>

        <!-- Test card info -->
        <div class="test-card-info p-3 bg-light rounded mt-3">
          <h6>Thẻ test (Môi trường thử nghiệm):</h6>
          <p class="mb-1"><strong>Số thẻ:</strong> 4242 4242 4242 4242</p>
          <p class="mb-1"><strong>MM/YY:</strong> 12/34</p>
          <p class="mb-1"><strong>CVC:</strong> 123</p>
          <p class="mb-0"><strong>ZIP:</strong> 12345</p>
        </div>

        <!-- Payment Actions -->
        <div class="payment-actions mt-4">
          <button 
            type="button" 
            pButton 
            [disabled]="isProcessing || !isStripeReady"
            (click)="processPayment()"
            class="payment-button w-100"
            [loading]="isProcessing">
            <span *ngIf="!isProcessing">Thanh toán {{formatCurrency(paymentAmount)}}</span>
            <span *ngIf="isProcessing">Đang xử lý thanh toán...</span>
          </button>

          <button 
            type="button" 
            pButton 
            pRipple 
            class="p-button-secondary w-100 mt-2"
            (click)="cancelPayment()">
            Hủy thanh toán
          </button>
        </div>

        <!-- Payment Status -->
        <div *ngIf="paymentStatus === 'processing'" class="payment-status processing">
          <p-progressSpinner [style]="{'width': '30px', 'height': '30px'}"></p-progressSpinner>
          <span class="ml-2">Đang xử lý thanh toán...</span>
        </div>

        <div *ngIf="paymentStatus === 'succeeded'" class="payment-status success">
          <i class="pi pi-check-circle text-success"></i>
          <span class="ml-2 text-success">Thanh toán thành công!</span>
        </div>

        <div *ngIf="paymentStatus === 'failed'" class="payment-status error">
          <i class="pi pi-times-circle text-danger"></i>
          <span class="ml-2 text-danger">Thanh toán thất bại. Vui lòng thử lại.</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardElement', { static: false }) cardElementRef!: ElementRef;
  @ViewChild('cardErrors', { static: false }) cardErrorsRef!: ElementRef;

  @Input() paymentAmount: number = 0;
  @Input() orderId: number = 0;
  @Input() customerName: string = '';
  @Input() customerEmail: string = '';

  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<string>();
  @Output() paymentCancel = new EventEmitter<void>();

  isStripeReady = false;
  isProcessing = false;
  paymentStatus: string = 'idle';
  
  private destroy$ = new Subject<void>();
  private cardElement: any = null;

  constructor(
    private stripeService: StripeService,
    private toastService: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    // Subscribe to payment status
    this.stripeService.paymentStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.paymentStatus = status;
        this.isProcessing = status === 'processing';
      });
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.stripeService.initializeStripe();
      this.cardElement = this.stripeService.createCardElement();
      
      if (this.cardElement && this.cardElementRef) {
        this.cardElement.mount(this.cardElementRef.nativeElement);
        this.isStripeReady = true;

        // Listen for real-time validation errors
        this.cardElement.on('change', (event: any) => {
          const displayError = this.cardErrorsRef.nativeElement;
          if (event.error) {
            displayError.textContent = event.error.message;
          } else {
            displayError.textContent = '';
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.toastService.fail('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
    }
  }

  async processPayment(): Promise<void> {
    if (!this.cardElement || this.isProcessing) return;

    this.isProcessing = true;
    this.stripeService.resetPaymentStatus();

    // 1. Create Payment Intent on our backend
    const paymentRequest: StripePaymentRequest = {
      amount: this.paymentAmount,
      currency: 'vnd',
      order_id: this.orderId,
      customer_email: this.customerEmail,
      customer_name: this.customerName
    };

    this.stripeService.createPaymentIntent(paymentRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          try {
            // 2. Confirm the card payment on the client-side with Stripe.js
            const paymentResult = await this.stripeService.confirmPayment(
              response.client_secret,
              {
                name: this.customerName,
                email: this.customerEmail
              }
            );

            if (paymentResult.status === 'succeeded') {
              // 3. Inform our backend that the payment was successful
              this.stripeService.confirmPaymentStatus(paymentResult.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (backendConfirmResponse) => {
                    if (backendConfirmResponse.status === 'succeeded') {
                      this.toastService.success('Thanh toán thành công!');
                      this.paymentSuccess.emit(paymentResult);
                    } else {
                      const errorMessage = backendConfirmResponse.message || 'Trạng thái thanh toán không thành công.';
                      this.toastService.fail(`Xác nhận thanh toán thất bại: ${errorMessage}`);
                      this.paymentError.emit(errorMessage);
                    }
                    this.isProcessing = false;
                  },
                  error: (backendError) => {
                    this.isProcessing = false;
                    this.toastService.fail('Lỗi khi xác nhận thanh toán với máy chủ.');
                    this.paymentError.emit(backendError.message || 'Backend confirmation failed');
                  }
                });
            } else {
              this.isProcessing = false;
              this.toastService.fail(`Thanh toán thất bại: ${paymentResult.status}`);
              this.paymentError.emit(`Trạng thái thanh toán: ${paymentResult.status}`);
            }
          } catch (confirmError: any) {
            this.isProcessing = false;
            this.toastService.fail(`Lỗi xác nhận thanh toán: ${confirmError.message}`);
            this.paymentError.emit(confirmError.message);
          }
        },
        error: (error) => {
          this.isProcessing = false;
          this.toastService.fail('Không thể tạo yêu cầu thanh toán.');
          this.paymentError.emit(error.message || 'Payment creation failed');
        }
      });
  }

  cancelPayment(): void {
    this.stripeService.resetPaymentStatus();
    this.paymentCancel.emit();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stripeService.destroyCardElement();
  }
} 
 