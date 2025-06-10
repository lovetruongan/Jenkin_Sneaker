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
        this.allRequests = data.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
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
    const actionObservable = this.currentAction === 'approve'
      ? this.returnService.approveReturnRequest(this.currentRequest.id, actionData)
      : this.returnService.rejectReturnRequest(this.currentRequest.id, actionData);

    actionObservable.subscribe({
      next: (updatedRequest) => {
        this.toastService.success(`Request ${this.currentAction}d successfully!`);
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
        this.toastService.fail(`Failed to ${this.currentAction} request. ` + (err.error?.message || ''));
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
} 