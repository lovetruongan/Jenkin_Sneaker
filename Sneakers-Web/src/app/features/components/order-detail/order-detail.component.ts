import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { CommonService } from '../../../core/services/common.service';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { InfoOrderDto } from '../../../core/dtos/InfoOrder.dto';
import { OrderDetailDto } from '../../../core/dtos/OrderDetail.dto';
import { CurrencyPipe,DatePipe,NgSwitch,NgSwitchCase } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgSwitch,
    NgSwitchCase,
    CommonModule,
    ButtonModule,
    RouterModule,
    TagModule
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent extends BaseComponent implements OnInit {
  public orderInfor: InfoOrderDto | null = null;
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
    private activatedRouter: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.id = this.activatedRouter.snapshot.paramMap.get('id') ?? '';
    
    if (this.id) {
      // Nếu có ID từ URL, load trực tiếp
      this.loadOrderInfo(parseInt(this.id));
    } else {
      // Nếu không có ID, lấy từ commonService
      this.commonService.orderId.pipe(
        filter(orderId => orderId > 0),
        switchMap((orderId) => {
          this.id = orderId.toString();
          return this.loadOrderInfo(orderId);
        }),
        catchError((err) => {
          console.error('Error loading order from commonService:', err);
          return of(err);
        })
      ).subscribe();
    }
  }

  private loadOrderInfo(orderId: number) {
    return this.orderService.getOrderInfor(orderId).pipe(
      filter((orderInfor: InfoOrderDto) => !!orderInfor),
      tap((orderInfor: InfoOrderDto) => {
        console.log('Order Info loaded:', orderInfor); // Debug log
        console.log('Order Status:', orderInfor.status); // Debug log
        
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
            this.shipCost = 30000;
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
        console.error('Error loading order info:', err);
        return of(err);
      })
    );
  }

  goToPayment(): void {
    if (this.orderInfor && this.orderInfor.id) {
      console.log('Navigating to payment for order:', this.orderInfor.id);
      this.router.navigate(['/payment', this.orderInfor.id]);
    }
  }

  // Helper method để check status - dùng cho debugging
  canShowPaymentButton(): boolean {
    if (!this.orderInfor) {
      console.log('No order info available');
      return false;
    }
    
    const status = this.orderInfor.status;
    const paymentMethod = this.orderInfor.payment_method;
    
    console.log('Checking payment button:', {
      status: status,
      paymentMethod: paymentMethod,
      orderId: this.orderInfor.id
    });
    
    // Không hiển thị nếu là thanh toán khi nhận hàng
    if (paymentMethod === 'Thanh toán khi nhận hàng') {
      console.log('Cash payment - no online payment needed');
      return false;
    }
    
    // Không hiển thị nếu đã hoàn thành
    if (status === 'success' || status === 'completed' || status === 'paid') {
      console.log('Order already completed');
      return false;
    }
    
    // Hiển thị nếu đang pending hoặc chưa có status
    const canShow = status === 'pending' || 
                   status === 'PENDING' ||
                   status === null ||
                   status === undefined ||
                   status === '';
                   
    console.log('Can show payment button:', canShow);
    return canShow;
  }
}