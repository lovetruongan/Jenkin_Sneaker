import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ReturnService, ReturnRequestResponse } from '../../../core/services/return.service';
import { ToastService } from '../../../core/services/toast.service';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { finalize } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-my-returns',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ToastService],
  templateUrl: './my-returns.component.html',
  styleUrl: './my-returns.component.scss'
})
export class MyReturnsComponent extends BaseComponent implements OnInit {
  myRequests: ReturnRequestResponse[] = [];
  isLoading = true;
  private readonly isBrowser: boolean;

  constructor(
    private returnService: ReturnService,
    private toastService: ToastService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadMyRequests();
  }

  loadMyRequests(): void {
    this.isLoading = true;
    this.returnService.getMyReturnRequests().subscribe({
      next: (data) => {
        this.myRequests = data.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.fail('Failed to load your return requests. ' + (err.error?.message || ''));
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'requested':
        return 'Đang chờ xử lý';
      case 'approved':
        return 'Đã chấp nhận';
      case 'rejected':
        return 'Đã từ chối';
      case 'completed':
        return 'Hoàn thành';
      case 'refund_processing':
        return 'Đang xử lý hoàn tiền';
      default:
        return status;
    }
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate([`/order-detail/${orderId}`]);
  }

  goToOrderHistory(): void {
    this.router.navigate(['/history-order']);
  }

  trackByRequestId(index: number, request: ReturnRequestResponse): number {
    return request.id;
  }
} 