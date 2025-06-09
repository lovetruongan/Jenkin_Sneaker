import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-momo-return',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="return-container">
      <div class="card">
        <div *ngIf="isSuccess" class="success-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div *ngIf="!isSuccess" class="error-icon">
          <i class="pi pi-times-circle"></i>
        </div>
        <h2>{{ message }}</h2>
        <p>Mã đơn hàng của bạn: <strong>{{ orderId }}</strong></p>
        <p>Số tiền: <strong>{{ amount | number:'1.0-0' }} VND</strong></p>
        <div *ngIf="!isSuccess">
          <p>Lý do: {{ failReason }}</p>
        </div>
        <button pButton type="button" label="Quay về trang chủ" (click)="goHome()"></button>
      </div>
    </div>
  `,
  styles: [`
    .return-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80vh;
      background-color: #f4f4f4;
    }
    .card {
      text-align: center;
      padding: 40px;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .success-icon i {
      font-size: 4rem;
      color: #28a745;
    }
    .error-icon i {
      font-size: 4rem;
      color: #dc3545;
    }
    h2 {
      margin-top: 20px;
      font-size: 1.5rem;
    }
    p {
      font-size: 1rem;
      color: #6c757d;
    }
    button {
      margin-top: 30px;
    }
  `]
})
export class MomoReturnComponent implements OnInit {
  isSuccess: boolean = false;
  message: string = '';
  orderId: string = '';
  amount: number = 0;
  failReason: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const resultCode = params['resultCode'];
      this.orderId = params['orderId'];
      this.amount = +params['amount'];

      if (resultCode === '0') {
        this.isSuccess = true;
        this.message = 'Thanh toán thành công!';
        // In a real app, you might want to call your backend to verify the transaction status again
      } else {
        this.isSuccess = false;
        this.message = 'Thanh toán thất bại';
        this.failReason = this.getFailReason(resultCode);
      }
    });
  }

  getFailReason(resultCode: string): string {
    // You can expand this with more specific error messages from MoMo's documentation
    switch (resultCode) {
      case '1001': return 'Giao dịch đã được khởi tạo, chờ người dùng xác nhận';
      case '1002': return 'Giao dịch bị từ chối';
      case '1003': return 'Giao dịch bị hủy';
      default: return 'Đã có lỗi xảy ra trong quá trình thanh toán.';
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
} 