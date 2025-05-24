import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { CommonService } from '../../../core/services/common.service';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { InfoOrderDto } from '../../../core/dtos/InfoOrder.dto';
import { OrderDetailDto } from '../../../core/dtos/OrderDetail.dto';
import { CurrencyPipe,DatePipe,NgSwitch,NgSwitchCase } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgSwitch,
    NgSwitchCase
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent extends BaseComponent implements OnInit {
  public orderInfor!: InfoOrderDto;
  public productOrderd!: OrderDetailDto[];
  public totalMoney: number = 0;
  public shipCost: number = 0;
  public notion!: string;
  public id!: string;
  public apiImage: string = environment.apiImage;
  public discountAmount: number = 0;
  public voucherInfo: { code: string, name: string, percentage: number } | null = null;
  public finalTotal: number = 0;

  constructor(
    private commonService: CommonService,
    private orderService: OrderService,
    private activatedRouter: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.id = this.activatedRouter.snapshot.paramMap.get('id') ?? '';
    this.commonService.orderId.pipe(
      switchMap((orderId) => {
        if(this.id == ''){
          this.id = orderId.toString();
        }
        return this.orderService.getOrderInfor(parseInt(this.id)).pipe(
          filter((orderInfor: InfoOrderDto) => !!orderInfor),
          tap((orderInfor: InfoOrderDto) => {
            this.orderInfor = orderInfor;
            this.productOrderd = orderInfor.order_details;
            this.notion = orderInfor.note;
            switch (orderInfor.shipping_method) {
              case "Tiêu chuẩn":
                this.shipCost = 30000;
                break;
              case "Nhanh":
                this.shipCost = 40000;
                break;
              case "Hỏa tốc":
                this.shipCost = 60000;
                break;
              default:
                break;
            }
            this.totalMoney = 0;
            this.productOrderd.forEach((item) => {
              this.totalMoney += item.totalMoney;
            });
            if (orderInfor.discount_amount) {
              this.discountAmount = orderInfor.discount_amount;
            }
            if (orderInfor.voucher) {
              this.voucherInfo = {
                code: orderInfor.voucher.code,
                name: orderInfor.voucher.name,
                percentage: orderInfor.voucher.discount_percentage
              };
            }
            if (orderInfor.total_money) {
              this.finalTotal = orderInfor.total_money;
            } else {
              this.finalTotal = this.totalMoney - this.discountAmount + this.shipCost;
            }
          }),
          catchError((err) => {
            return of(err)
          }),
        )
      }),
      catchError((err) => {
        return of(err)
      }),
    ).subscribe();
  }
}
