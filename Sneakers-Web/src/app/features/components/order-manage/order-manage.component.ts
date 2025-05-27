import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { CurrencyPipe, DatePipe } from '@angular/common';
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
    { label: 'Đã được giao', value: 'delivered' },
    { label: 'Đang được giao', value: 'shipped' },
    { label: 'Đã giao hàng', value: 'success' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  constructor(
    private orderService: OrderService,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
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
        this.toastService.fail(err.error.message);
        this.loading = false;
        return of(err);
      })
    ).subscribe();
  }

  onOrderStateChange(event: any, orderId: number) {
    this.orderService.changeOrderState(event.value, orderId).pipe(
      tap((res: {message: string}) => {
        this.toastService.success(res.message);
      }),
      tap(() => {
        this.loadData();
      }),
      catchError((err) => {
        this.toastService.fail(err.error.message);
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
      case 'success':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Trạng thái';
    }
  }
}
