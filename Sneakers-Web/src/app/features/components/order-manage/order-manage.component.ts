import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgSwitch, NgSwitchCase, NgClass } from '@angular/common';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { HistoryOrderDto } from '../../../core/dtos/HistoryOrder.dto';
import { environment } from '../../../../environments/environment.development';
import { MenuItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { OrderService } from '../../../core/services/order.service';
import { catchError, of, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { OrderListResponse } from '../../../core/responses/order.list.response';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-order-manage',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    NgSwitch,
    NgSwitchCase,
    RouterLink,
    DropdownModule,
    ToastModule,
    FormsModule,
    ConfirmDialogModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    CardModule,
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    DialogModule,
    NgClass
  ],
  providers: [
    MessageService,
    ToastService,
    ConfirmationService
  ],
  templateUrl: './order-manage.component.html',
  styleUrl: './order-manage.component.scss'
})
export class OrderManageComponent extends BaseComponent implements OnInit {
  public allOrders: HistoryOrderDto[] = [];
  public loading: boolean = true;
  public apiImage: string = environment.apiImage;
  public orderStateOptions: MenuItem[] = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang chờ', value: 'pending' },
    { label: 'Đang xử lý', value: 'processing' },
    { label: 'Đang được giao', value: 'shipped' },
    { label: 'Đã được giao', value: 'delivered' },
    { label: 'Đã hủy', value: 'canceled' }
  ];
  public searchForm: FormGroup;
  public totalRecords: number = 0;
  public pageSize: number = 15;
  public page: number = 0;
  public sortField: string = 'orderDate';
  public sortOrder: number = -1; // -1 for desc, 1 for asc
  public showSearchDialog: boolean = false;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
    this.searchForm = this.fb.group({
      keyword: [''],
      status: [''],
      dateRange: [[]]
    });
  }

  private checkPermissions(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    const userInfo = localStorage.getItem('userInfor');
    if (!userInfo) {
      this.toastService.fail('Vui lòng đăng nhập để tiếp tục');
      this.router.navigate(['/auth-login']);
      return false;
    }
    const user = JSON.parse(userInfo);
    if (!user.role || user.role.id !== 2) { // 2 is admin role
      this.toastService.fail('Bạn không có quyền truy cập trang này');
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }

  ngOnInit(): void {
    if(!this.checkPermissions()) {
      return;
    }

    this.loadOrders();

    this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadOrders();
    });
  }

  loadOrders(event?: any) {
    if(!this.checkPermissions()) {
      return;
    }

    let sortField = 'orderDate';
    let sortOrder = this.sortOrder;

    if (event) {
      if (event.first != null && event.rows != null) {
        this.page = event.first / event.rows;
        this.pageSize = event.rows;
      }
      if (event.sortOrder) {
        sortOrder = event.sortOrder;
        this.sortOrder = sortOrder; // Cập nhật lại state
      }
    }
    
    this.loading = true;
    const { keyword, status, dateRange } = this.searchForm.value;
    const startDate = dateRange && dateRange[0] ? this.formatDate(dateRange[0]) : null;
    const endDate = dateRange && dateRange[1] ? this.formatDate(dateRange[1]) : null;
    
    const safePage = this.page != null ? this.page : 0;
    const safePageSize = this.pageSize != null ? this.pageSize : 15;
    const sortDir = sortOrder === -1 ? 'desc' : 'asc';

    this.orderService.getOrdersByKeyword(
      keyword || '', status, startDate, endDate, 
      safePage, safePageSize, 
      sortField, sortDir
    ).pipe(
        tap((response: OrderListResponse) => {
          this.allOrders = response.orders;
          this.totalRecords = response.totalPages * safePageSize;
          this.loading = false;
        }),
        catchError(err => {
          const errorMessage = err?.error?.message || 'Không thể tải danh sách đơn hàng';
          this.toastService.fail(errorMessage);
          this.loading = false;
          return of(err);
        })
      ).subscribe();
  }

  private mapSortField(frontendField: string): string {
    // Không cần thiết nữa, nhưng giữ lại để tránh lỗi nếu có tham chiếu ở đâu đó
    return 'orderDate';
  }

  resetSearch() {
    this.searchForm.reset({
      keyword: '',
      status: '',
      dateRange: []
    });
    this.page = 0;
    this.sortField = 'orderDate';
    this.sortOrder = -1;
    this.loadOrders();
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  getPaymentMethodClass(paymentMethod: string): string {
    if (paymentMethod === 'Stripe Card Payment') {
      return 'payment-method-stripe-success';
    }
    if (paymentMethod === 'Pending Stripe Payment') {
      return 'payment-method-stripe-pending';
    }
    if (paymentMethod === 'Thanh toán khi nhận hàng') {
      return 'payment-method-cod';
    }
    return 'payment-method-default';
  }

  onOrderStateChange(event: any, orderId: number) {
    if(!this.checkPermissions()) {
      return;
    }
    
    this.orderService.changeOrderState(event.value, orderId).pipe(
      tap((res: {message: string}) => {
        this.toastService.success(res.message);
        this.loadOrders();
      }),
      catchError((err) => {
        if (err.status === 403) {
          this.toastService.fail('Bạn không có quyền thực hiện thao tác này');
          this.router.navigate(['/']);
        } else {
          const errorMessage = err?.error?.message || 'Không thể cập nhật trạng thái đơn hàng';
          this.toastService.fail(errorMessage);
        }
        return of(err);
      })
    ).subscribe();
  }

  getPlaceholderByOrderStatus(status: string): string {
    const selectedStatus = this.orderStateOptions.find(opt => opt['value'] === status);
    return selectedStatus ? selectedStatus.label as string : 'Trạng thái';
  }
}
