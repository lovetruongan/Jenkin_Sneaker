import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { StripePaymentComponent } from '../stripe-payment/stripe-payment.component';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-stripe-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
    StripePaymentComponent,
    ToastModule
  ],
  providers: [ToastService, MessageService],
  template: `
    <div class="stripe-test-container">
      <p-toast></p-toast>
      
      <div class="container mt-4">
        <h2 class="text-center mb-4">🧪 Stripe Payment Test</h2>
        
        <div class="row justify-content-center">
          <div class="col-md-8">
            <p-card>
              <ng-template pTemplate="header">
                <div class="text-center p-3">
                  <h4>Test Stripe Integration</h4>
                  <p class="text-muted">Kiểm tra chức năng thanh toán bằng thẻ Visa/Mastercard</p>
                </div>
              </ng-template>
              
              <div class="test-form">
                <!-- Test Configuration -->
                <div class="form-section mb-4">
                  <h5>🔧 Cấu hình Test</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <label for="amount">Số tiền (VND):</label>
                      <p-inputNumber 
                        id="amount"
                        [(ngModel)]="testAmount" 
                        mode="currency" 
                        currency="VND" 
                        locale="vi-VN"
                        [min]="1000"
                        [max]="10000000"
                        class="w-100">
                      </p-inputNumber>
                    </div>
                    <div class="col-md-6">
                      <label for="orderId">Order ID:</label>
                      <p-inputNumber 
                        id="orderId"
                        [(ngModel)]="testOrderId" 
                        [useGrouping]="false"
                        [min]="1"
                        class="w-100">
                      </p-inputNumber>
                    </div>
                  </div>
                  
                  <div class="row mt-3">
                    <div class="col-md-6">
                      <label for="customerName">Tên khách hàng:</label>
                      <input 
                        id="customerName"
                        type="text" 
                        pInputText 
                        [(ngModel)]="testCustomerName" 
                        class="w-100"
                        placeholder="Nguyễn Văn A">
                    </div>
                    <div class="col-md-6">
                      <label for="customerEmail">Email:</label>
                      <input 
                        id="customerEmail"
                        type="email" 
                        pInputText 
                        [(ngModel)]="testCustomerEmail" 
                        class="w-100"
                        placeholder="test@example.com">
                    </div>
                  </div>
                </div>

                <!-- Test Cards Info -->
                <div class="test-cards-info mb-4">
                  <h5>💳 Thẻ Test của Stripe</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="card-info p-3 border rounded">
                        <h6 class="text-success">✅ Thẻ thành công</h6>
                        <p><strong>Visa:</strong> 4242 4242 4242 4242</p>
                        <p><strong>Mastercard:</strong> 5555 5555 5555 4444</p>
                        <p><strong>MM/YY:</strong> 12/34</p>
                        <p><strong>CVC:</strong> 123</p>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card-info p-3 border rounded">
                        <h6 class="text-danger">❌ Thẻ bị từ chối</h6>
                        <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
                        <p><strong>Insufficient funds:</strong> 4000 0000 0000 9995</p>
                        <p><strong>MM/YY:</strong> 12/34</p>
                        <p><strong>CVC:</strong> 123</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="test-actions text-center">
                  <button 
                    pButton 
                    type="button" 
                    label="🚀 Bắt đầu Test Thanh toán" 
                    class="p-button-lg"
                    [disabled]="showPayment"
                    (click)="startPaymentTest()">
                  </button>
                  
                  <button 
                    pButton 
                    type="button" 
                    label="🔄 Reset Test" 
                    class="p-button-secondary p-button-lg ml-2"
                    (click)="resetTest()">
                  </button>
                </div>
              </div>
            </p-card>
          </div>
        </div>

        <!-- Stripe Payment Component -->
        <div class="row justify-content-center mt-4" *ngIf="showPayment">
          <div class="col-md-8">
            <app-stripe-payment
              [paymentAmount]="testAmount"
              [orderId]="testOrderId"
              [customerName]="testCustomerName"
              [customerEmail]="testCustomerEmail"
              (paymentSuccess)="onPaymentSuccess($event)"
              (paymentError)="onPaymentError($event)"
              (paymentCancel)="onPaymentCancel()">
            </app-stripe-payment>
          </div>
        </div>

        <!-- Test Results -->
        <div class="row justify-content-center mt-4" *ngIf="testResult">
          <div class="col-md-8">
            <p-card>
              <ng-template pTemplate="header">
                <div class="text-center p-3">
                  <h4 [class]="testResult.success ? 'text-success' : 'text-danger'">
                    {{ testResult.success ? '✅ Test Thành Công' : '❌ Test Thất Bại' }}
                  </h4>
                </div>
              </ng-template>
              
              <div class="test-result-details">
                <p><strong>Thời gian:</strong> {{ testResult.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</p>
                <p><strong>Số tiền:</strong> {{ testAmount | currency:'VND':'symbol':'1.0-0' }}</p>
                <p><strong>Order ID:</strong> {{ testOrderId }}</p>
                <p><strong>Khách hàng:</strong> {{ testCustomerName }} ({{ testCustomerEmail }})</p>
                
                <div *ngIf="testResult.success" class="success-details p-3 bg-light rounded">
                  <h6>Chi tiết thành công:</h6>
                  <p><strong>Payment Intent ID:</strong> {{ testResult.paymentIntentId }}</p>
                  <p><strong>Status:</strong> {{ testResult.status }}</p>
                </div>
                
                <div *ngIf="!testResult.success" class="error-details p-3 bg-light rounded">
                  <h6>Chi tiết lỗi:</h6>
                  <p class="text-danger">{{ testResult.error }}</p>
                </div>
              </div>
            </p-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./stripe-test.component.scss']
})
export class StripeTestComponent implements OnInit {
  // Test configuration
  testAmount: number = 100000; // 100,000 VND
  testOrderId: number = 999;
  testCustomerName: string = 'Test User';
  testCustomerEmail: string = 'test@example.com';
  
  // Test state
  showPayment: boolean = false;
  testResult: any = null;

  constructor(
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Initialize test data
    this.resetTestData();
  }

  startPaymentTest(): void {
    if (!this.validateTestData()) {
      return;
    }

    this.showPayment = true;
    this.testResult = null;
    this.toastService.success('Đã khởi tạo test thanh toán!');
  }

  resetTest(): void {
    this.showPayment = false;
    this.testResult = null;
    this.resetTestData();
    this.toastService.success('Đã reset test!');
  }

  onPaymentSuccess(paymentIntent: any): void {
    this.testResult = {
      success: true,
      timestamp: new Date(),
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      error: null
    };
    
    this.showPayment = false;
    this.toastService.success('🎉 Test thanh toán thành công!');
  }

  onPaymentError(error: string): void {
    this.testResult = {
      success: false,
      timestamp: new Date(),
      paymentIntentId: null,
      status: 'failed',
      error: error
    };
    
    this.toastService.fail(`❌ Test thất bại: ${error}`);
  }

  onPaymentCancel(): void {
    this.showPayment = false;
    this.toastService.success('Đã hủy test thanh toán');
  }

  private validateTestData(): boolean {
    if (!this.testAmount || this.testAmount < 1000) {
      this.toastService.fail('Số tiền phải ít nhất 1,000 VND');
      return false;
    }

    if (!this.testOrderId || this.testOrderId < 1) {
      this.toastService.fail('Order ID phải lớn hơn 0');
      return false;
    }

    if (!this.testCustomerName?.trim()) {
      this.toastService.fail('Tên khách hàng không được để trống');
      return false;
    }

    if (!this.testCustomerEmail?.trim() || !this.testCustomerEmail.includes('@')) {
      this.toastService.fail('Email không hợp lệ');
      return false;
    }

    return true;
  }

  private resetTestData(): void {
    this.testAmount = 100000;
    this.testOrderId = Math.floor(Math.random() * 1000) + 1;
    this.testCustomerName = 'Test User';
    this.testCustomerEmail = 'test@example.com';
  }
} 