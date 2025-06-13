import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReturnService,
  ReturnRequestResponse,
  AdminReturnAction,
  VnpayRefundRequest
} from '../../../core/services/return.service';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-return-manage',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, TagModule, ButtonModule,
    InputTextModule, DialogModule, ProgressSpinnerModule, CardModule, TooltipModule,
    InputTextareaModule, DatePipe
  ],
  providers: [MessageService, ToastService],
  templateUrl: './return-manage.component.html',
  styleUrls: ['./return-manage.component.scss']
})
export class ReturnManageComponent implements OnInit {
  allRequests: ReturnRequestResponse[] = [];
  isLoading = true;
  
  // Dialog
  displayActionDialog = false;
  displayVnpayRefundDialog = false; // For VNPAY refund
  currentAction: 'approve' | 'reject' | null = null;
  currentRequest: ReturnRequestResponse | null = null;
  adminNotes = '';
  isSubmitting = false;

  // Stats
  totalRequests = 0;
  pendingRequests = 0;
  approvedRequests = 0;
  rejectedRequests = 0;

  private readonly isBrowser: boolean;

  constructor(
    private returnService: ReturnService,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadAllRequests();
  }

  loadAllRequests(): void {
    this.isLoading = true;
    this.returnService.getAllReturnRequestsForAdmin().subscribe({
      next: (data: ReturnRequestResponse[]) => {
        console.log('loadAllRequests: received data:', data);
        
        // Log first item to see structure
        if (data.length > 0) {
          console.log('loadAllRequests: first item structure:', data[0]);
          console.log('loadAllRequests: first item requested_at:', data[0].requested_at);
        }
        
        this.allRequests = data.sort((a, b) => {
          const dateA = this.parseDate(a.requested_at);
          const dateB = this.parseDate(b.requested_at);
          return dateB.getTime() - dateA.getTime();
        });
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastService.fail('Failed to load return requests. ' + (err.error?.message || ''));
      }
    });
  }

  private parseDate(dateValue: any): Date {
    if (!dateValue) return new Date(0);
    
    try {
      if (typeof dateValue === 'string' && dateValue.includes(',')) {
        const parts = dateValue.split(',').map(p => parseInt(p.trim()));
        if (parts.length >= 6) {
          return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
        }
      }
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? new Date(0) : parsed;
    } catch {
      return new Date(0);
    }
  }

  calculateStats(): void {
    this.totalRequests = this.allRequests.length;
    this.pendingRequests = this.allRequests.filter(r => r.status === 'PENDING').length;
    this.approvedRequests = this.allRequests.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED' || r.status === 'REFUNDED' || r.status === 'AWAITING_REFUND').length;
    this.rejectedRequests = this.allRequests.filter(r => r.status === 'REJECTED').length;
  }

  filterGlobal(event: Event, dt: any): void {
    dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  showActionDialog(request: ReturnRequestResponse, action: 'approve' | 'reject'): void {
    this.currentRequest = request;
    this.currentAction = action;
    this.adminNotes = '';
    this.displayActionDialog = true;
  }

  showVnpayRefundDialog(request: ReturnRequestResponse): void {
    this.currentRequest = request;
    this.adminNotes = 'Refund for order ' + request.order_id; // Default note
    this.displayVnpayRefundDialog = true;
  }

  confirmVnpayRefund(): void {
    if (!this.currentRequest) {
      this.toastService.fail('No request selected for refund.');
      return;
    }

    if (!this.adminNotes.trim()) {
        this.toastService.fail('Admin notes are required for VNPAY refund.');
        return;
    }
    
    this.isSubmitting = true;

    // TODO: Replace 'admin' with the actual logged-in admin's username
    const refundData: VnpayRefundRequest = {
      return_request_id: this.currentRequest.id,
      order_id: this.currentRequest.order_id,
      amount: this.currentRequest.refund_amount,
      order_info: this.adminNotes,
      created_by: 'admin'
    };

    console.log('VNPAY Refund Request Data:', refundData);
    
    this.returnService.refundVnpay(refundData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.displayVnpayRefundDialog = false;
        this.toastService.success('VNPAY refund processed successfully! Order status updated to canceled.');
        
        // Reload the entire list to ensure all statuses are up-to-date
        this.loadAllRequests();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.fail('VNPAY refund failed: ' + (err.error?.message || err.message));
      }
    });
  }

  confirmAction(): void {
    if (!this.currentRequest || !this.currentAction || !this.adminNotes.trim()) {
      this.toastService.fail('Admin notes are required.');
      return;
    }

    this.isSubmitting = true;
    const actionData: AdminReturnAction = { admin_notes: this.adminNotes };
    
    let actionObservable;
    let successMessage = '';
    
    if (this.currentRequest.status === 'AWAITING_REFUND') {
      // Complete manual refund
      actionObservable = this.returnService.completeRefund(this.currentRequest.id, actionData);
      successMessage = 'Manual refund completed successfully! Order status updated to canceled.';
    } else if (this.currentAction === 'approve') {
      actionObservable = this.returnService.approveReturnRequest(this.currentRequest.id, actionData);
      successMessage = 'Request approved successfully! Order status updated accordingly.';
    } else {
      actionObservable = this.returnService.rejectReturnRequest(this.currentRequest.id, actionData);
      successMessage = 'Request rejected successfully!';
    }

    actionObservable.subscribe({
      next: (updatedRequest) => {
        this.toastService.success(successMessage);
        this.displayActionDialog = false;
        this.isSubmitting = false;
        
        const index = this.allRequests.findIndex(r => r.id === updatedRequest.id);
        if (index > -1) {
          this.allRequests[index] = updatedRequest;
          this.allRequests = [...this.allRequests];
          this.calculateStats();
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastService.fail(`Failed to process request. ` + (err.error?.message || ''));
      }
    });
  }

  approveReturnRequestAndRefund(request: ReturnRequestResponse): void {
    if (!this.isBrowser) return;

    if (!confirm('Are you sure you want to approve this request and process a Stripe refund? This action cannot be undone.')) {
      return;
    }

    this.isSubmitting = true;
    const actionData: AdminReturnAction = { admin_notes: 'Stripe refund processed automatically.' };

    this.returnService.approveReturnRequest(request.id, actionData).subscribe({
      next: (updatedRequest) => {
        this.isSubmitting = false;
        this.toastService.success('Request approved and Stripe refund initiated successfully!');

        const index = this.allRequests.findIndex(r => r.id === updatedRequest.id);
        if (index > -1) {
          this.allRequests[index] = updatedRequest;
          this.allRequests = [...this.allRequests]; // Trigger change detection
          this.calculateStats();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.fail('Stripe refund failed: ' + (err.error?.message || err.message));
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'warning';
      case 'APPROVED':
      case 'AWAITING_REFUND': return 'info';
      case 'REJECTED': return 'danger';
      case 'COMPLETED':
      case 'REFUNDED': return 'success';
      default: return undefined;
    }
  }

  getOrderStatusDisplay(status: string): string {
    switch (status?.toLowerCase()) {
      case 'canceled': return 'Đã hủy';
      case 'awaiting_refund': return 'Chờ hoàn tiền';
      case 'delivered': return 'Đã giao';
      case 'shipped': return 'Đang giao';
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Đang xử lý';
      default: return status || 'Không xác định';
    }
  }

  getOrderStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | undefined {
    switch (status?.toLowerCase()) {
      case 'canceled': return 'danger';
      case 'awaiting_refund': return 'warning';
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'confirmed': return 'info';
      case 'pending': return 'warning';
      default: return undefined;
    }
  }

  showCompleteRefundDialog(request: ReturnRequestResponse): void {
    this.currentRequest = request;
    this.currentAction = 'approve'; // We'll use this for complete refund
    this.adminNotes = '';
    this.displayActionDialog = true;
  }

  getDialogHeader(): string {
    if (this.currentRequest?.status === 'AWAITING_REFUND') {
      return 'Xác nhận hoàn tiền thủ công';
    }
    return this.currentAction === 'approve' ? 'Chấp thuận yêu cầu' : 'Từ chối yêu cầu';
  }

  formatDate(dateValue: any): string {
    // Debug logging
    console.log('formatDate input:', dateValue, 'type:', typeof dateValue);
    
    if (!dateValue) {
      console.log('formatDate: dateValue is falsy');
      return 'N/A';
    }
    
    try {
      let parsedDate: Date;
      
      // Handle different date formats
      if (typeof dateValue === 'string') {
        console.log('formatDate: processing string value:', dateValue);
        
        // If it's a comma-separated string like "2025,6,10,8,46,39"
        if (dateValue.includes(',')) {
          console.log('formatDate: comma-separated string detected');
          const parts = dateValue.split(',').map(p => parseInt(p.trim()));
          console.log('formatDate: parsed parts:', parts);
          
          if (parts.length >= 6) {
            // JavaScript Date constructor: year, month (0-indexed), day, hour, minute, second
            parsedDate = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
            console.log('formatDate: created date from parts:', parsedDate);
          } else {
            console.log('formatDate: insufficient parts, using Date constructor');
            parsedDate = new Date(dateValue);
          }
        } else if (dateValue.includes('-') || dateValue.includes('T')) {
          // ISO format or similar
          console.log('formatDate: ISO-like format detected');
          parsedDate = new Date(dateValue);
        } else {
          console.log('formatDate: using default Date constructor');
          parsedDate = new Date(dateValue);
        }
      } else if (dateValue instanceof Date) {
        console.log('formatDate: Date object detected');
        parsedDate = dateValue;
      } else if (typeof dateValue === 'number') {
        console.log('formatDate: number (timestamp) detected');
        parsedDate = new Date(dateValue);
      } else if (Array.isArray(dateValue) && dateValue.length >= 6) {
        // Handle array format [2025, 6, 10, 8, 46, 39]
        console.log('formatDate: array format detected:', dateValue);
        parsedDate = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], dateValue[3], dateValue[4], dateValue[5]);
      } else {
        console.log('formatDate: unknown format, returning N/A');
        return 'N/A';
      }
      
      console.log('formatDate: parsed date:', parsedDate);
      
      // Check if the date is valid
      if (isNaN(parsedDate.getTime())) {
        console.log('formatDate: invalid date');
        return 'N/A';
      }
      
      // Format the date
      const day = parsedDate.getDate().toString().padStart(2, '0');
      const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = parsedDate.getFullYear().toString().slice(-2);
      const hours = parsedDate.getHours().toString().padStart(2, '0');
      const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
      
      const result = `${day}/${month}/${year} ${hours}:${minutes}`;
      console.log('formatDate: final result:', result);
      return result;
    } catch (error) {
      console.error('Error formatting date:', dateValue, error);
      return 'N/A';
    }
  }

  getDialogMessage(): string {
    if (this.currentRequest?.status === 'AWAITING_REFUND') {
      return `Bạn đã hoàn tiền thủ công cho đơn hàng <strong>#${this.currentRequest.order_id}</strong>? 
              Hành động này sẽ chuyển trạng thái đơn hàng thành <strong>ĐÃ HỦY</strong>.`;
    }
    
    const action = this.currentAction === 'approve' ? 'CHẤP THUẬN' : 'TỪ CHỐI';
    let additionalInfo = '';
    
    if (this.currentAction === 'approve') {
      const isStripe = this.currentRequest?.payment_method === 'Thanh toán thẻ thành công';
      additionalInfo = isStripe 
        ? ' Hệ thống sẽ tự động hoàn tiền qua Stripe và chuyển trạng thái đơn hàng thành <strong>ĐÃ HỦY</strong>.'
        : ' Trạng thái đơn hàng sẽ chuyển thành <strong>CHỜ HOÀN TIỀN</strong> để admin xử lý thủ công.';
    }
    
    return `Bạn có chắc muốn <strong>${action}</strong> yêu cầu trả hàng cho đơn hàng <strong>#${this.currentRequest?.order_id}</strong>?${additionalInfo}`;
  }
} 