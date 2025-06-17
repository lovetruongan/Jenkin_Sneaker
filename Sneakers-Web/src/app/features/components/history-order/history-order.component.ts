import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { OrderService } from '../../../core/services/order.service';
import { filter, tap } from 'rxjs';
import { HistoryOrderDto } from '../../../core/dtos/HistoryOrder.dto';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history-order',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgSwitch,
    NgSwitchCase,
    RouterLink
  ],
  templateUrl: './history-order.component.html',
  styleUrl: './history-order.component.scss'
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

  viewOrderDetail(orderId: number){
    this.router.navigate([`/order-detail/${orderId}`]);
  }

}
