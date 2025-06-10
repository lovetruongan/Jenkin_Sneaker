import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReturnService, ReturnRequestResponse, AdminReturnAction } from '../../../core/services/return.service';
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
    InputTextareaModule
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
        this.allRequests = data.sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastService.fail('Failed to load return requests. ' + (err.error?.message || ''));
      }
    });
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