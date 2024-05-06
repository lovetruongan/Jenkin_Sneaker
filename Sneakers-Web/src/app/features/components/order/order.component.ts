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
    AsyncPipe
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
  private productOrderLocalStorage: ProductsInCartDto[] = [];
  public blockedUi: boolean = false;
  private orderId: number = 0;

  public methodShipping!: {
    name: string,
    code: string,
    price: number
  }[];
  public methodShippingValue!: {name: string, code: string,price: number};
  public selectedPayMethod!: {name: string, key: string};

  payMethod: {
    name: string,
    key: string
  }[] = [
    { name: 'Thanh toán khi nhận hàng', key: 'Cash' },
    { name: 'Chuyển khoản ngân hàng', key: 'Banking' },
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private toastService: ToastService,
    private orderService: OrderService,
    private commonService: CommonService,
    private router: Router,
    private productService: ProductService
  ) {
    super();
    this.inforShipForm = this.fb.group({
      fullName: [, Validators.required],
      address: [, Validators.required],
      phoneNumber :[, Validators.required],
      email: [],
      note:[]
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

  order(){
    if (this.inforShipForm.invalid){
      this.toastService.fail("Vui lòng nhập đầy đủ thông tin giao hàng");
    } else {
      this.blockUi();
      this.orderService.postOrder({
        fullname: this.inforShipForm.value.fullName,
        email: this.inforShipForm.value.email,
        phone_number: this.inforShipForm.value.phoneNumber,
        address: this.inforShipForm.value.address,
        note: this.inforShipForm.value.note,
        shipping_method: this.methodShippingValue.name,
        payment_method: this.selectedPayMethod.name,
        cart_items: this.productOrder,
        total_money: this.totalCost
      }).pipe(
        tap((orderInfor: any) => {
          this.orderId = orderInfor.id;
          this.commonService.orderId.next(orderInfor.id); 
        }),
        switchMap(() => {
          this.productOrderLocalStorage = JSON.parse(localStorage.getItem("productOrder")!);
          const fncDel = this.productOrderLocalStorage.map((po) => this.productService.deleteProductFromCart(po.id))
          return forkJoin(fncDel);
        }),
        tap(() => {
          this.commonService.intermediateObservable.next(true);
          localStorage.removeItem("productOrder");
          this.blockUi();
          this.router.navigate([`/order-detail/${this.orderId}`]);
        }),
        catchError((err) => {
          this.blockUi();
          this.toastService.fail("Đặt hàng không thành công");
          return of(err);
        }),
        takeUntil(this.destroyed$)
      ).subscribe();
    }
  }

  blockUi() {
    this.blockedUi = !this.blockedUi;
  }
}
