import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { OrderService } from '../../../core/services/order.service';
import { catchError, filter, of, tap } from 'rxjs';
import { HistoryOrderDto } from '../../../core/dtos/HistoryOrder.dto';
import { CurrencyPipe, DatePipe, NgSwitch, NgSwitchCase } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { Router, RouterLink } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history-order',
  standalone: true,
  imports: [
    CurrencyPipe, 
    DatePipe, 
    NgSwitch, 
    NgSwitchCase, 
    RouterLink,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    DropdownModule,
    InputTextModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ToastModule,
    PaginatorModule,
    FormsModule
  ],
  templateUrl: './history-order.component.html',
  styleUrls: ['./history-order.component.scss']
})
export class HistoryOrderComponent extends BaseComponent implements OnInit {
  public historyOrder: HistoryOrderDto[] = [];
  public filteredOrders: HistoryOrderDto[] = [];
  public apiImage: string = environment.apiImage;
  public loading: boolean = false;
  public searchTerm: string = '';
  
  public statusOptions = [
    { label: 'Tất cả', value: null },
    { label: 'Đang chờ', value: 'pending' },
    { label: 'Đang xử lý', value: 'processing' },
    { label: 'Đang được giao', value: 'shipped' },
    { label: 'Đã giao hàng', value: 'success' },
    { label: 'Đã được giao', value: 'delivered' },
    { label: 'Đã hủy', value: 'cancelled' }
  ];
  
  public selectedStatus: string | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    this.loading = true;
    this.orderService.getHistoryOrder().pipe(
      filter((historyOrder: HistoryOrderDto[]) => !!historyOrder),
      tap((historyOrder: HistoryOrderDto[]) => {
        // Sắp xếp theo mã đơn hàng từ lớn đến bé (newest first)
        this.historyOrder = historyOrder.sort((a, b) => b.id - a.id);
        this.applyFilters();
        this.loading = false;
      }),
      catchError((error) => {
        this.loading = false;
        console.error('Error loading order history:', error);
        return of([]);
      })
    ).subscribe();
  }

  applyFilters(): void {
    let filtered = [...this.historyOrder];

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchLower) ||
        order.product_name.toLowerCase().includes(searchLower) ||
        order.buyer_name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    this.filteredOrders = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.applyFilters();
  }

  viewOrderDetail(orderId: number): void {
    this.router.navigate(['/order-detail', orderId]);
  }

  canReturnOrder(order: HistoryOrderDto): boolean {
    const eligibleStatuses = ['delivered', 'success', 'shipped'];
    if (!eligibleStatuses.includes(order.status.toLowerCase())) {
        return false;
    }

    const orderDate = new Date(order.order_date);
    const today = new Date();
    const timeDifference = today.getTime() - orderDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

    return daysDifference <= 30;
  }

  requestReturn(orderId: number): void {
    this.router.navigate(['/return-request', orderId]);
  }

  paginate(event: any): void {
    // Handle pagination if needed
    // This method is required by p-paginator but for now we can leave it empty
    // since pagination is handled automatically by the component
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'info';
      case 'success':
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đang chờ';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang được giao';
      case 'success':
        return 'Đã giao hàng';
      case 'delivered':
        return 'Đã được giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }
}
