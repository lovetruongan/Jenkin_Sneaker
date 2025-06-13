import { AfterViewInit, Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonService } from '../../../core/services/common.service';
import { ProductsInCartDto } from '../../../core/dtos/productsInCart.dto';
import { catchError, forkJoin, of, switchMap, takeUntil, tap } from 'rxjs';
import { CurrencyPipe, AsyncPipe } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OrderService } from '../../../core/services/order.service';
import { ProductToCartDto } from '../../../core/dtos/productToCart.dto';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { VoucherService } from '../../../core/services/voucher.service';
import { VoucherApplicationResponseDto } from '../../../core/dtos/voucherApplication.dto';
import { ButtonModule } from 'primeng/button';
import { StripePaymentComponent } from '../stripe-payment/stripe-payment.component';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    InputTextModule,
    InputTextareaModule,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DropdownModule,
    ToastModule,
    BlockUIModule,
    ProgressSpinnerModule,
    AsyncPipe,
    ButtonModule,
    StripePaymentComponent,
    DialogModule,
    CardModule,
    DividerModule,
    TooltipModule
  ],
  providers: [
    ToastService,
    MessageService
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent extends BaseComponent implements OnInit,AfterViewInit {
  public inforShipForm: FormGroup;
  public productToOrder!: ProductsInCartDto[];
  public productOrder: ProductToCartDto[] = [];
  public totalCost: number = 0;
  public finalCost: number = 0; // Total after discount
  public discountAmount: number = 0;
  public voucherCode: string = '';
  public isVoucherApplied: boolean = false;
  public appliedVoucherName: string = '';
  public apiImage: string = environment.apiImage;
  
  private productOrderLocalStorage: ProductsInCartDto[] = [];
  public blockedUi: boolean = false;
  public orderId: number = 0;

  public methodShipping!: {
    name: string,
    code: string,
    price: number
  }[];
  public methodShippingValue!: {name: string, code: string,price: number};
  public selectedPayMethod!: {name: string, key: string, logo: string};

  payMethod: {
    name: string,
    key: string,
    logo: string
  }[] = [
    { name: 'Thanh toán khi nhận hàng', key: 'Cash', logo: 'assets/images/payment-icons/cash.svg' },
    { name: 'Chuyển khoản ngân hàng', key: 'Banking', logo: 'assets/images/payment-icons/bank.svg' },
    { name: 'Thanh toán bằng thẻ Visa/Mastercard', key: 'Stripe', logo: 'assets/images/payment-icons/stripe.svg' },
  ];

  // Stripe payment properties
  public showStripeDialog: boolean = false;
  public isStripePayment: boolean = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private toastService: ToastService,
    private orderService: OrderService,
    private commonService: CommonService,
    private router: Router,
    private productService: ProductService,
    private voucherService: VoucherService
  ) {
    super();
    this.inforShipForm = this.fb.group({
      fullName: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.email]],
      note: ['']
    })
  }
  ngOnInit(): void {
    this.productToOrder = JSON.parse(localStorage.getItem("productOrder")!); 
    this.productToOrder.forEach((item) => {
      this.productOrder.push({
        product_id: item.products.id,
        quantity: item.quantity,
        size: item.size
      })
    })

    this.productToOrder.forEach((item) => {
      this.totalCost += item.products.price * item.quantity
    })
    
    this.finalCost = this.totalCost; // Initialize final cost

    this.methodShipping = [
      {name: 'Tiêu chuẩn', code: 'TC', price: 30000},
      {name: 'Nhanh', code:'N', price: 40000},
      {name: 'Hỏa tốc', code: 'HT', price: 60000}
    ];
    this.methodShippingValue = this.methodShipping[0];
    this.selectedPayMethod = this.payMethod[0];
  }

  ngAfterViewInit(): void {
   
  }

  applyVoucher(): void {
    if (!this.voucherCode.trim()) {
      this.toastService.fail("Vui lòng nhập mã voucher");
      return;
    }

    this.voucherService.applyVoucher({
      voucher_code: this.voucherCode,
      order_total: this.totalCost
    }).pipe(
      tap((response: VoucherApplicationResponseDto) => {
        if (response.is_applied) {
          this.isVoucherApplied = true;
          this.discountAmount = response.discount_amount || 0;
          this.finalCost = response.final_total || this.totalCost;
          this.appliedVoucherName = response.voucher_name || '';
          this.toastService.success(response.message || 'Áp dụng voucher thành công');
        } else {
          this.resetVoucher();
          this.toastService.fail(response.message || 'Không thể áp dụng voucher. Vui lòng thử lại.');
        }
      }),
      catchError((err) => {
        this.resetVoucher();
        this.toastService.fail(err.error?.message || 'Lỗi không xác định khi áp dụng voucher.');
        return of(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  removeVoucher(): void {
    this.resetVoucher();
    this.toastService.success("Đã hủy áp dụng voucher");
  }

  private resetVoucher(): void {
    this.isVoucherApplied = false;
    this.discountAmount = 0;
    this.finalCost = this.totalCost;
    this.voucherCode = '';
    this.appliedVoucherName = '';
  }

  order(){
    if (this.inforShipForm.invalid){
      this.toastService.fail("Vui lòng nhập đầy đủ thông tin giao hàng");
    } else {
      // Check if Stripe payment is selected
      if (this.selectedPayMethod.key === 'Stripe') {
        this.processStripeOrder();
      } else {
        this.processRegularOrder();
      }
    }
  }

  private processStripeOrder(): void {
    // Create order first, then show Stripe payment dialog
    this.blockUi();
    
    // Get user info from localStorage (optional, as backend uses token)
    const userInfor = JSON.parse(localStorage.getItem("userInfor") || '{}');
    const userId = userInfor.id;

    const orderData = {
      ...(userId && { user_id: Number(userId) }),
      fullname: this.inforShipForm.value.fullName,
      email: this.inforShipForm.value.email,
      phone_number: this.inforShipForm.value.phoneNumber,
      address: this.inforShipForm.value.address,
      note: this.inforShipForm.value.note || '',
      shipping_method: this.methodShippingValue.name,
      payment_method: 'Pending Stripe Payment',
      cart_items: this.productOrder.map(item => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        size: Number(item.size)
      })),
      total_money: Math.round(this.finalCost),
      ...(this.isVoucherApplied && { voucher_code: this.voucherCode })
    };

    this.orderService.postOrder(orderData).pipe(
      tap((orderInfor: any) => {
        this.orderId = orderInfor.id;
        this.commonService.orderId.next(orderInfor.id);
        this.blockUi();
        // Show Stripe payment dialog
        this.showStripeDialog = true;
        this.isStripePayment = true;
      }),
      catchError((err) => {
        this.blockUi();
        console.error('Order creation error:', err);
        this.toastService.fail("Không thể tạo đơn hàng: " + (err.error?.message || err.message));
        return of(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private processRegularOrder(): void {
    this.blockUi();
    
    // Get user info from localStorage (optional, as backend uses token)
    const userInfor = JSON.parse(localStorage.getItem("userInfor") || '{}');
    const userId = userInfor.id;

    const orderData = {
      ...(userId && { user_id: Number(userId) }),
      fullname: this.inforShipForm.value.fullName,
      email: this.inforShipForm.value.email,
      phone_number: this.inforShipForm.value.phoneNumber,
      address: this.inforShipForm.value.address,
      note: this.inforShipForm.value.note || '',
      shipping_method: this.methodShippingValue.name,
      payment_method: this.selectedPayMethod.key,
      cart_items: this.productOrder.map(item => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        size: Number(item.size)
      })),
      total_money: Math.round(this.finalCost + this.methodShippingValue.price),
      ...(this.isVoucherApplied && { voucher_code: this.voucherCode })
    };

    this.orderService.postOrder(orderData).pipe(
      tap((newOrder: any) => {
        this.orderId = newOrder.id;
        this.toastService.success("Đặt hàng thành công!");
        this.commonService.intermediateObservable.next(true);
        localStorage.removeItem("productOrder");
        this.router.navigate([`/order-detail/${this.orderId}`]);
        this.blockUi();
      }),
      catchError((err) => {
        this.blockUi();
        console.error('Order creation error:', err);
        this.toastService.fail("Đặt hàng thất bại: " + (err.error?.message || err.message));
        return of(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  onStripePaymentSuccess(paymentIntent: any): void {
    // Payment successful, update order status on backend
    this.blockUi();
    this.orderService.updateOrderStatus(this.orderId, 'Paid').pipe(
      tap(() => {
        this.showStripeDialog = false;
        this.toastService.success("Thanh toán và đặt hàng thành công!");
        this.commonService.intermediateObservable.next(true);
        localStorage.removeItem("productOrder");
        this.router.navigate([`/order-detail/${this.orderId}`]);
        this.blockUi();
      }),
      catchError((err) => {
        this.blockUi();
        this.toastService.fail('Cập nhật trạng thái đơn hàng thất bại. Vui lòng liên hệ hỗ trợ.');
        return of(err);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  onStripePaymentError(error: string): void {
    this.toastService.fail(`Thanh toán thất bại: ${error}`);
    // Keep dialog open for retry
  }

  onStripePaymentCancel(): void {
    this.showStripeDialog = false;
    this.toastService.success("Đã hủy thanh toán");
    // Order is already created but payment is pending
  }

  blockUi() {
    this.blockedUi = !this.blockedUi;
  }
}
