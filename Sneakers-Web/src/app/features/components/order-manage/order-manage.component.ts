import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { HistoryOrderDto } from '../../../core/dtos/HistoryOrder.dto';
import { environment } from '../../../../environments/environment.development';
import { MenuItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { OrderService } from '../../../core/services/order.service';
import { catchError, of, tap } from 'rxjs';
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
    CardModule
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
    { label: 'Đang chờ', value: 'pending' },
    { label: 'Đang xử lý', value: 'processing' },
    { label: 'Đang được giao', value: 'shipped' },
    { label: 'Đã được giao', value: 'delivered' },
    { label: 'Đã hủy', value: 'canceled' }
  ];

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super();
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if user is logged in and has admin role
    const userInfo = localStorage.getItem('userInfor');
    if (!userInfo) {
      this.toastService.fail('Vui lòng đăng nhập để tiếp tục');
      this.router.navigate(['/auth-login']);
      return;
    }

    const user = JSON.parse(userInfo);
    if (!user.role || user.role.id !== 2) { // 2 is admin role
      this.toastService.fail('Bạn không có quyền truy cập trang này');
      this.router.navigate(['/']);
      return;
    }

    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.orderService.getAllOrders().pipe(
      tap(orders => {
        this.allOrders = orders.sort((a, b) => {
          return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
        });
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

  onOrderStateChange(event: any, orderId: number) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check if user is still logged in and has admin role
    const userInfo = localStorage.getItem('userInfor');
    if (!userInfo) {
      this.toastService.fail('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
      this.router.navigate(['/auth-login']);
      return;
    }

    const user = JSON.parse(userInfo);
    if (!user.role || user.role.id !== 2) {
      this.toastService.fail('Bạn không có quyền thực hiện thao tác này');
      this.router.navigate(['/']);
      return;
    }

    this.orderService.changeOrderState(event.value, orderId).pipe(
      tap((res: {message: string}) => {
        this.toastService.success(res.message);
      }),
      tap(() => {
        this.loadData();
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
    switch(status) {
      case 'pending':
        return 'Đang chờ';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang được giao';
      case 'delivered':
        return 'Đã được giao';
      case 'canceled':
        return 'Đã hủy';
      default:
        return 'Trạng thái';
    }
  }
}
