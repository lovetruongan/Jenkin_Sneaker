import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { OrderService } from '../../../core/services/order.service';
import { filter, tap } from 'rxjs';
import { HistoryOrderDto } from '../../../core/dtos/HistoryOrder.dto';
import { CurrencyPipe, DatePipe, NgSwitch, NgSwitchCase } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-history-order',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgSwitch, NgSwitchCase, RouterLink],
  templateUrl: './history-order.component.html',
  styleUrls: ['./history-order.component.scss']
})
export class HistoryOrderComponent extends BaseComponent implements OnInit {
  public historyOrder: HistoryOrderDto[] = [];
  public apiImage: string = environment.apiImage;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.orderService.getHistoryOrder().pipe(
      filter((historyOrder: HistoryOrderDto[]) => !!historyOrder),
      tap((historyOrder: HistoryOrderDto[]) => {
        this.historyOrder = historyOrder;
      })
    ).subscribe();
  }

  viewOrderDetail(orderId: number) {
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
}
