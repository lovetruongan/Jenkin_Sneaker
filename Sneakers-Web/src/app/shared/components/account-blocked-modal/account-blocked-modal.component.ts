import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account-blocked-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="show" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="warning-icon">⚠️</div>
          <h2>Tài khoản bị khóa</h2>
        </div>
        
        <div class="modal-body">
          <p class="main-message">Tài khoản của bạn đã bị khóa do vi phạm chính sách của hệ thống.</p>
          <div class="details">
            <ul>
              <li>Vui lòng liên hệ với quản trị viên để được hỗ trợ</li>
              <li>Email: elearn&#64;hoctot.com</li>
              <li>Hotline: 1900-1000</li>
            </ul>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-primary" (click)="onClose()">
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
    }

    .modal-header {
      text-align: center;
      padding: 2rem 2rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .warning-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .modal-header h2 {
      margin: 0;
      color: #dc2626;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .modal-body {
      padding: 2rem;
    }

    .main-message {
      font-size: 1.1rem;
      color: #374151;
      margin-bottom: 1.5rem;
      text-align: center;
      font-weight: 500;
    }

    .details {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1.5rem;
      border-left: 4px solid #dc2626;
    }

    .details ul {
      margin: 0;
      padding-left: 1.5rem;
    }

    .details li {
      color: #6b7280;
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    .modal-footer {
      padding: 1rem 2rem 2rem;
      text-align: center;
    }

    .btn-primary {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-primary:hover {
      background: #b91c1c;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 768px) {
      .modal-content {
        margin: 1rem;
        width: calc(100% - 2rem);
      }
      
      .modal-header, .modal-body, .modal-footer {
        padding: 1.5rem;
      }
    }
  `]
})
export class AccountBlockedModalComponent {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
} 