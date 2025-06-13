import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    CardModule, InputTextModule, ButtonModule, ProgressSpinnerModule, 
    PasswordModule, DividerModule
  ],
  providers: [MessageService, ToastService],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-wrapper">
        <div class="logo-section">
          <img src="../../../../assets/images/hvmlogo.gif" alt="Logo" class="logo">
          <h1 class="brand-title">SNEAKER STORE</h1>
        </div>
        
        <p-card class="reset-password-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-lock header-icon"></i>
              <h2>Đặt lại mật khẩu</h2>
            </div>
          </ng-template>
          
          <div class="card-content">
            <p class="description">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
            
            <div class="form-field">
              <label for="newPassword" class="field-label">
                <i class="pi pi-key"></i>
                Mật khẩu mới
              </label>
              <p-password 
                id="newPassword" 
                [(ngModel)]="newPassword" 
                [feedback]="true"
                styleClass="password-field"
                inputStyleClass="password-input"
                placeholder="Nhập mật khẩu mới"
                [promptLabel]="'Nhập mật khẩu'"
                [weakLabel]="'Yếu'"
                [mediumLabel]="'Trung bình'"
                [strongLabel]="'Mạnh'"
                [class.p-invalid]="!newPassword && isSubmitted">
              </p-password>
              <small class="error-text" *ngIf="!newPassword && isSubmitted">
                Vui lòng nhập mật khẩu mới
              </small>
            </div>
            
            <div class="form-field">
              <label for="confirmPassword" class="field-label">
                <i class="pi pi-check-circle"></i>
                Xác nhận mật khẩu
              </label>
              <p-password 
                id="confirmPassword" 
                [(ngModel)]="confirmPassword" 
                [feedback]="false"
                styleClass="password-field"
                inputStyleClass="password-input"
                placeholder="Nhập lại mật khẩu mới"
                [class.p-invalid]="(!confirmPassword || passwordMismatch) && isSubmitted">
              </p-password>
              <small class="error-text" *ngIf="!confirmPassword && isSubmitted">
                Vui lòng xác nhận mật khẩu
              </small>
              <small class="error-text" *ngIf="passwordMismatch && isSubmitted">
                Mật khẩu xác nhận không khớp
              </small>
            </div>
          </div>
          
          <ng-template pTemplate="footer">
            <div class="card-footer">
              <p-button 
                label="Đặt lại mật khẩu" 
                icon="pi pi-check" 
                [loading]="isLoading" 
                (click)="onSubmit()" 
                class="submit-button"
                styleClass="w-full p-button-lg">
              </p-button>
              
              <p-divider align="center">
                <span class="divider-text">hoặc</span>
              </p-divider>
              
              <div class="back-link-container">
                <a routerLink="/auth-login" class="back-link">
                  <i class="pi pi-arrow-left"></i>
                  Quay lại đăng nhập
                </a>
              </div>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .reset-password-wrapper {
      width: 100%;
      max-width: 450px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
      margin-bottom: 1rem;
    }

    .brand-title {
      color: white;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 1px;
    }

    ::ng-deep .reset-password-card {
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      border: none;
      overflow: hidden;
      background: white;
    }

    ::ng-deep .reset-password-card .p-card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: none;
      padding: 2rem 2rem 1.5rem;
    }

    .card-header {
      text-align: center;
      color: white;
    }

    .header-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    ::ng-deep .reset-password-card .p-card-body {
      padding: 2rem;
    }

    .card-content {
      margin-bottom: 1rem;
    }

    .description {
      text-align: center;
      color: #6c757d;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .form-field {
      margin-bottom: 1.5rem;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .field-label i {
      color: #667eea;
    }

    ::ng-deep .password-field {
      width: 100%;
    }

    ::ng-deep .password-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    ::ng-deep .password-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    ::ng-deep .password-field.p-invalid .password-input {
      border-color: #dc3545;
    }

    .error-text {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
      display: block;
    }

    .card-footer {
      text-align: center;
    }

    ::ng-deep .submit-button .p-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    ::ng-deep .submit-button .p-button:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    ::ng-deep .p-divider .p-divider-content {
      background-color: white;
    }

    .divider-text {
      color: #6c757d;
      font-size: 0.85rem;
      padding: 0 1rem;
    }

    .back-link-container {
      margin-top: 1rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .back-link:hover {
      color: #764ba2;
      transform: translateX(-3px);
    }

    .back-link i {
      transition: transform 0.3s ease;
    }

    .back-link:hover i {
      transform: translateX(-2px);
    }

    ::ng-deep .p-password-panel {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 480px) {
      .reset-password-container {
        padding: 1rem;
      }
      
      .brand-title {
        font-size: 1.5rem;
      }
      
      ::ng-deep .reset-password-card .p-card-header,
      ::ng-deep .reset-password-card .p-card-body {
        padding: 1.5rem;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  isSubmitted = false;

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Lấy token từ query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (!this.token) {
        this.toastService.fail('Token đặt lại mật khẩu không hợp lệ.');
        this.router.navigate(['/auth-login']);
      }
    });
  }

  get passwordMismatch(): boolean {
    return this.newPassword !== this.confirmPassword && this.confirmPassword.length > 0;
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (!this.newPassword || !this.confirmPassword) {
      this.toastService.fail('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastService.fail('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastService.fail('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    this.isLoading = true;
    this.userService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.success(
          response.message || 
          'Đặt lại mật khẩu thành công.'
        );
        setTimeout(() => {
          this.router.navigate(['/auth-login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.fail(
          err.error?.message || 
          'Đã xảy ra lỗi. Vui lòng thử lại.'
        );
      }
    });
  }
} 