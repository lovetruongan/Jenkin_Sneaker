import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    CardModule, InputTextModule, ButtonModule, ProgressSpinnerModule, DividerModule
  ],
  template: `
    <div class="forgot-password-container">
      <div class="forgot-password-wrapper">
        <div class="logo-section">
          <img src="../../../../assets/images/hvmlogo.gif" alt="Logo" class="logo">
          <h1 class="brand-title">SNEAKER STORE</h1>
        </div>
        
        <p-card class="forgot-password-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-key header-icon"></i>
              <h2>Quên mật khẩu</h2>
            </div>
          </ng-template>
          
          <div class="card-content">
            <p class="description">
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn 
              một liên kết để đặt lại mật khẩu.
            </p>
            
            <div class="form-field">
              <label for="email" class="field-label">
                <i class="pi pi-envelope"></i>
                Địa chỉ Email
              </label>
              <input 
                id="email" 
                type="email" 
                pInputText 
                [(ngModel)]="email" 
                class="email-input"
                placeholder="Nhập địa chỉ email của bạn"
                [class.p-invalid]="!email && isSubmitted" />
              <small class="error-text" *ngIf="!email && isSubmitted">
                Vui lòng nhập địa chỉ email
              </small>
            </div>
          </div>
          
          <ng-template pTemplate="footer">
            <div class="card-footer">
              <p-button 
                label="Gửi liên kết đặt lại" 
                icon="pi pi-send" 
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
    .forgot-password-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .forgot-password-wrapper {
      width: 100%;
      max-width: 420px;
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

    ::ng-deep .forgot-password-card {
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      border: none;
      overflow: hidden;
      background: white;
    }

    ::ng-deep .forgot-password-card .p-card-header {
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

    ::ng-deep .forgot-password-card .p-card-body {
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

    ::ng-deep .email-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    ::ng-deep .email-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }

    ::ng-deep .email-input.p-invalid {
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

    @media (max-width: 480px) {
      .forgot-password-container {
        padding: 1rem;
      }
      
      .brand-title {
        font-size: 1.5rem;
      }
      
      ::ng-deep .forgot-password-card .p-card-header,
      ::ng-deep .forgot-password-card .p-card-body {
        padding: 1.5rem;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  isSubmitted = false;

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    this.isSubmitted = true;
    
    if (!this.email) {
      this.toastService.fail('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.toastService.fail('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    this.isLoading = true;
    this.userService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.success(
          response.message || 
          'Gửi email thành công. Vui lòng kiểm tra email của bạn.'
        );
        this.email = '';
        this.isSubmitted = false;
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 