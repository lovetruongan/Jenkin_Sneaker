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
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    CardModule, InputTextModule, ButtonModule, ProgressSpinnerModule, 
    PasswordModule, DividerModule
  ],
  providers: [MessageService, ToastService],
  template: `
    <div class="change-password-container">
      <div class="change-password-wrapper">
        <div class="header-section">
          <h1 class="page-title">
            <i class="pi pi-key title-icon"></i>
            Đổi mật khẩu
          </h1>
          <p class="page-subtitle">Thay đổi mật khẩu tài khoản của bạn</p>
        </div>
        
        <p-card class="change-password-card">
          <ng-template pTemplate="header">
            <div class="card-header">
              <i class="pi pi-shield header-icon"></i>
              <h2>Bảo mật tài khoản</h2>
            </div>
          </ng-template>
          
          <div class="card-content">
            <div class="form-field">
              <label for="currentPassword" class="field-label">
                <i class="pi pi-lock"></i>
                Mật khẩu hiện tại
              </label>
              <p-password 
                id="currentPassword" 
                [(ngModel)]="currentPassword" 
                [feedback]="false"
                styleClass="password-field"
                inputStyleClass="password-input"
                placeholder="Nhập mật khẩu hiện tại"
                [class.p-invalid]="!currentPassword && isSubmitted">
              </p-password>
              <small class="error-text" *ngIf="!currentPassword && isSubmitted">
                Vui lòng nhập mật khẩu hiện tại
              </small>
            </div>

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
                Xác nhận mật khẩu mới
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
                Vui lòng xác nhận mật khẩu mới
              </small>
              <small class="error-text" *ngIf="passwordMismatch && isSubmitted">
                Mật khẩu xác nhận không khớp
              </small>
            </div>

            <div class="security-tips">
              <h4><i class="pi pi-info-circle"></i> Lời khuyên bảo mật:</h4>
              <ul>
                <li>Sử dụng ít nhất 8 ký tự</li>
                <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>Không sử dụng thông tin cá nhân dễ đoán</li>
                <li>Thay đổi mật khẩu định kỳ</li>
              </ul>
            </div>
          </div>
          
          <ng-template pTemplate="footer">
            <div class="card-footer">
              <div class="button-group">
                <p-button 
                  label="Hủy" 
                  icon="pi pi-times" 
                  severity="secondary"
                  class="cancel-button"
                  styleClass="p-button-outlined"
                  routerLink="/Home">
                </p-button>
                <p-button 
                  label="Đổi mật khẩu" 
                  icon="pi pi-check" 
                  [loading]="isLoading" 
                  (click)="onSubmit()" 
                  class="submit-button">
                </p-button>
              </div>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .change-password-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .change-password-wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 2.2rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
    }

    .title-icon {
      color: #667eea;
      font-size: 2rem;
    }

    .page-subtitle {
      color: #6c757d;
      font-size: 1.1rem;
      margin: 0;
    }

    ::ng-deep .change-password-card {
      border-radius: 20px;
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
      border: none;
      overflow: hidden;
      background: white;
    }

    ::ng-deep .change-password-card .p-card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: none;
      padding: 1.5rem 2rem;
    }

    .card-header {
      text-align: center;
      color: white;
    }

    .header-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
    }

    ::ng-deep .change-password-card .p-card-body {
      padding: 2.5rem;
    }

    .card-content {
      margin-bottom: 1rem;
    }

    .form-field {
      margin-bottom: 2rem;
    }

    .field-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .field-label i {
      color: #667eea;
      font-size: 1.1rem;
    }

    ::ng-deep .password-field {
      width: 100%;
    }

    ::ng-deep .password-input {
      width: 100%;
      padding: 1rem 1.25rem;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #fafbfc;
    }

    ::ng-deep .password-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      background: white;
    }

    ::ng-deep .password-field.p-invalid .password-input {
      border-color: #dc3545;
      background: #fff5f5;
    }

    .error-text {
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      display: block;
      font-weight: 500;
    }

    .security-tips {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
    }

    .security-tips h4 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #495057;
      font-size: 1rem;
      margin: 0 0 1rem 0;
      font-weight: 600;
    }

    .security-tips h4 i {
      color: #17a2b8;
    }

    .security-tips ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #6c757d;
    }

    .security-tips li {
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .card-footer {
      text-align: center;
      border-top: 1px solid #f0f1f2;
      padding-top: 1.5rem;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    ::ng-deep .cancel-button .p-button {
      border: 2px solid #6c757d;
      color: #6c757d;
      background: transparent;
      border-radius: 12px;
      font-weight: 600;
      padding: 0.75rem 2rem;
      transition: all 0.3s ease;
    }

    ::ng-deep .cancel-button .p-button:hover {
      background: #6c757d;
      color: white;
      transform: translateY(-2px);
    }

    ::ng-deep .submit-button .p-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      font-weight: 600;
      padding: 0.75rem 2rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    ::ng-deep .submit-button .p-button:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    ::ng-deep .p-password-panel {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .change-password-container {
        padding: 1rem;
      }
      
      .page-title {
        font-size: 1.8rem;
      }
      
      ::ng-deep .change-password-card .p-card-body {
        padding: 1.5rem;
      }
      
      .button-group {
        flex-direction: column;
      }
      
      ::ng-deep .cancel-button .p-button,
      ::ng-deep .submit-button .p-button {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.5rem;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      ::ng-deep .change-password-card .p-card-header {
        padding: 1rem;
      }
    }
  `]
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  isSubmitted = false;

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  get passwordMismatch(): boolean {
    return this.newPassword !== this.confirmPassword && this.confirmPassword.length > 0;
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.toastService.fail('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastService.fail('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastService.fail('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.toastService.fail('Mật khẩu mới phải khác với mật khẩu hiện tại.');
      return;
    }

    this.isLoading = true;
    this.userService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.success(
          response.message || 
          'Đổi mật khẩu thành công.'
        );
        this.resetForm();
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

  private resetForm(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.isSubmitted = false;
  }
} 