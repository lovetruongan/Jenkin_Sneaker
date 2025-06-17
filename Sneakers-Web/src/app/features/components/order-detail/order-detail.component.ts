import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { CommonService } from '../../../core/services/common.service';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { InfoOrderDto } from '../../../core/dtos/InfoOrder.dto';
import { OrderDetailDto } from '../../../core/dtos/OrderDetail.dto';
import { CurrencyPipe,DatePipe,NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductService } from '../../../core/services/product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    NgClass,
    ToastModule
  ],
  providers: [ToastService, MessageService],
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
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private productService: ProductService
  ) {
    super();
  }

  ngOnInit(): void {
    const idFromUrl = this.activatedRouter.snapshot.paramMap.get('id');
    if (!idFromUrl) {
        // Handle case where ID is missing from URL
        this.toastService.fail('Không tìm thấy mã đơn hàng.');
        this.router.navigate(['/history']);
        return;
    }
    this.id = idFromUrl;
    
    // Handle VNPAY return first
    this.activatedRouter.queryParams.subscribe(params => {
      const paymentStatus = params['vnp_ResponseCode'];
      if (paymentStatus) {
        this.handleVnpayReturn(paymentStatus, this.id);
      } else {
        // Normal page load
        this.loadOrderDetail(this.id);
      }
    });
  }

  handleVnpayReturn(status: string, orderId: string): void {
    const orderIdNum = parseInt(orderId, 10);
    
    // Clean URL query params immediately to prevent re-triggering
    this.router.navigate([], {
      relativeTo: this.activatedRouter,
      queryParams: {},
      replaceUrl: true
    });
    
    if (status === '00') {
      this.orderService.updateOrderStatus(orderIdNum, 'paid').pipe(
        switchMap(() => this.productService.deleteAllProductsFromCart())
      ).subscribe({
        next: () => {
          this.toastService.success('Thanh toán thành công! Giỏ hàng đã được xóa.');
          localStorage.removeItem('productOrder');
          this.commonService.intermediateObservable.next(true);

          // Force reload after a short delay to ensure state is fresh
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error: (err) => {
          this.toastService.fail('Có lỗi xảy ra khi hoàn tất đơn hàng. Vui lòng liên hệ hỗ trợ.');
          this.loadOrderDetail(orderId);
        }
      });
    } else {
      this.orderService.updateOrderStatus(orderIdNum, 'payment_failed').subscribe({
        next: () => {
          this.toastService.fail('Thanh toán VNPAY thất bại hoặc đã bị hủy.');
          this.loadOrderDetail(orderId);
        },
        error: (err) => {
          this.toastService.fail('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
          this.loadOrderDetail(orderId);
        }
      });
    }
  }

  loadOrderDetail(orderId: string): void {
    this.orderService.getOrderInfor(parseInt(orderId)).pipe(
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
          this.totalMoney += item.total_money;
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
        this.toastService.fail('Không thể tải thông tin đơn hàng.');
        return of(err)
      }),
    ).subscribe();
  }

  printInvoice(): void {
    window.print();
  }
}
