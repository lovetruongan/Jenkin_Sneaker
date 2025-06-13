import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// DTOs and Services
import { OrderHistoryResponse } from '../../../core/responses/order-history.response';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

// PrimeNG Modules
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

// Components
import { StripePaymentComponent } from '../stripe-payment/stripe-payment.component';

@Component({
  selector: 'app-history-order',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    FormsModule,
    PaginatorModule,
    TagModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    TooltipModule,
    ProgressSpinnerModule,
    ToastModule,
    DialogModule,
    StripePaymentComponent
  ],
  providers: [MessageService, ToastService],
  templateUrl: './history-order.component.html',
  styleUrls: ['./history-order.component.scss']
})
export class HistoryOrderComponent implements OnInit {
  historyOrder: OrderHistoryResponse[] = [];
  filteredOrders: OrderHistoryResponse[] = [];
  pagedOrders: OrderHistoryResponse[] = [];
  loading = true;
  apiImage = environment.apiImage;

  // Filtering
  searchTerm: string = '';
  statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang chờ', value: 'pending' },
    { label: 'Đang xử lý', value: 'processing' },
    { label: 'Đang giao', value: 'shipped' },
    { label: 'Đã giao', value: 'delivered' },
    { label: 'Đã hủy', value: 'cancelled' },
    { label: 'Thanh toán thất bại', value: 'payment_failed' }
  ];
  selectedStatus: string = '';

  // Pagination
  rows: number = 8;

  // Stripe Payment
  showStripeDialog: boolean = false;
  selectedOrderForPayment: OrderHistoryResponse | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    this.loading = true;
    const token = localStorage.getItem('token') as string;
    this.orderService.findByUserId(token).subscribe({
      next: (data: any) => {
        this.historyOrder = data.sort((a: OrderHistoryResponse, b: OrderHistoryResponse) => b.id - a.id);
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load order history', err);
        this.toastService.fail('Không thể tải lịch sử đơn hàng.');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let orders = [...this.historyOrder];

    if (this.selectedStatus) {
      orders = orders.filter(order => order.status === this.selectedStatus);
    }

    if (this.searchTerm.trim()) {
      const lowercasedTerm = this.searchTerm.toLowerCase();
      orders = orders.filter(order =>
        order.id.toString().includes(lowercasedTerm) ||
        order.product_name.toLowerCase().includes(lowercasedTerm) ||
        order.fullname.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    this.filteredOrders = orders;
    this.paginate({ first: 0, rows: this.rows });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  paginate(event: PaginatorState | { first: number, rows: number }): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows;
    this.pagedOrders = this.filteredOrders.slice(first, first + rows);
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Đang chờ',
      'processing': 'Đang xử lý',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
      'paid': 'Đã thanh toán',
      'payment_failed': 'Thanh toán thất bại'
    };
    return statusMap[status] || 'Không xác định';
  }

  getStatusSeverity(status: string): 'info' | 'warning' | 'success' | 'danger' | 'primary' {
    const severityMap: { [key: string]: 'info' | 'warning' | 'success' | 'danger' | 'primary' } = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'paid': 'success',
      'cancelled': 'danger',
      'payment_failed': 'danger'
    };
    return severityMap[status] || 'info';
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/order-detail', orderId]);
  }

  canReturnOrder(order: OrderHistoryResponse): boolean {
    if (order.status !== 'delivered') return false;
    const deliveryDate = new Date(order.order_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - deliveryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }

  requestReturn(orderId: number): void {
    this.router.navigate(['/return-request', orderId]);
  }

  getRoundedAmount(amount: number): number {
    return Math.round(amount);
  }

  // --- Stripe Payment Retry Logic ---
  retryPayment(order: OrderHistoryResponse): void {
    this.selectedOrderForPayment = order;
    this.showStripeDialog = true;
  }

  onStripePaymentSuccess(paymentIntent: any): void {
    this.showStripeDialog = false;
    this.toastService.success('Thanh toán lại thành công!');
    this.loadOrderHistory(); // Refresh the order list
  }

  onStripePaymentError(error: string): void {
    this.showStripeDialog = false;
    this.toastService.fail(`Thanh toán lại thất bại: ${error}`);
  }

  onStripePaymentCancel(): void {
    this.showStripeDialog = false;
    this.toastService.fail('Bạn đã hủy phiên thanh toán.');
  }
}
