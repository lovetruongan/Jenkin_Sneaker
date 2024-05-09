import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { HistoryOrderDto } from '../../../core/dtos/HistoryOrder.dto';
import { environment } from '../../../../environments/environment.development';
import { MenuItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { OrderService } from '../../../core/services/order.service';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';

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
    ToastModule
  ],
  providers: [
    MessageService,
    ToastService,
  ],
  templateUrl: './order-manage.component.html',
  styleUrl: './order-manage.component.scss'
})
export class OrderManageComponent extends BaseComponent implements OnInit{
  public allOrders: HistoryOrderDto[] = [];
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
    this.orderService.getAllOrders().pipe(
      filter((historyOrder: HistoryOrderDto[]) => !!historyOrder),
      tap((historyOrder: HistoryOrderDto[]) => {
        this.allOrders = historyOrder;
      })
    ).subscribe();
  }

  onOrderStateChange(event: any, orderId: number){
    this.orderService.changeOrderState(event.value, orderId).pipe(
      tap((res: {message: string}) => {
        this.toastService.success(res.message);
      }),
      switchMap(() => {
        return this.orderService.getAllOrders().pipe(
          filter((historyOrder: HistoryOrderDto[]) => !!historyOrder),
          tap((historyOrder: HistoryOrderDto[]) => {
            this.allOrders = historyOrder;
          })
        )
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
