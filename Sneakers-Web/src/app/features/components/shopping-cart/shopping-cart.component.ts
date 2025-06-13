import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { ProductService } from '../../../core/services/product.service';
import { Subject, catchError, debounceTime, filter, map, of, switchMap, take, takeUntil, tap, forkJoin } from 'rxjs';
import { ProductsInCartDto } from '../../../core/dtos/productsInCart.dto';
import { ProductFromCartDto } from '../../../core/dtos/ProductFromCart.dto';
import { CurrencyPipe } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { KeyFilterModule } from 'primeng/keyfilter';
import { ButtonModule } from 'primeng/button';
import { CommonService } from '../../../core/services/common.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductToCartDto } from '../../../core/dtos/productToCart.dto';
import { ToastService } from '../../../core/services/toast.service';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    CurrencyPipe,
    InputNumberModule,
    FormsModule,
    KeyFilterModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    CheckboxModule,
    DividerModule
  ],
  providers:[
    ConfirmationService,
    ToastService,
    MessageService
  ],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss'
})
export class ShoppingCartComponent extends BaseComponent implements OnInit, AfterViewInit {
  public productsInCart : ProductsInCartDto[] = [];
  public totalCost: number = 0;
  public shipCost: number = 30000;
  public updateProductSubject = new Subject<{
    id: number,
    quantity: number
  }>();
  public productToOrder: ProductsInCartDto[] =[];
  public apiImage: string = environment.apiImage;
  
constructor(
  private productService: ProductService,
  private commonService: CommonService,
  private confirmationService: ConfirmationService,
  private readonly messageService: MessageService,
  private toastService: ToastService,
  private router: Router
) {
  super();
}
  ngOnInit(): void {
    this.productService.getProductFromCart().pipe(
      filter((product : ProductFromCartDto) => !!product),
      tap((product : ProductFromCartDto) => {
        this.productsInCart = product.carts;
        this.resetTotalCost();
      }),
      takeUntil(this.destroyed$),
      catchError((err) => of(err))
    ).subscribe();
  }

  ngAfterViewInit(): void {
    this.commonService.intermediateObservable.pipe(
      switchMap(() => {
        return this.productService.getProductFromCart().pipe(
          filter((product : ProductFromCartDto) => !!product),
          tap((product : ProductFromCartDto) => {
            this.productsInCart = product.carts;
          }),
          takeUntil(this.destroyed$),
          catchError((err) => of(err))
        )
      }),
      takeUntil(this.destroyed$),
      catchError((err) => of(err))
    ).subscribe();

    this.updateProductSubject.pipe(
      map((productInfo: {
        id: number,
        quantity: number,
      }) => {
        let updateProduct!: ProductToCartDto;
        this.productsInCart.forEach((product) => {
          if (product.id == productInfo.id){
            if (productInfo.quantity === 0){
              this.confirmDelete(product.id);
              return;
            } else {
              product.quantity = productInfo.quantity;
              updateProduct = {
                product_id : product.products.id,
                quantity : product.quantity,
                size : product.size
              }
              this.resetTotalCost();
            }
          }
        })
        return { id: productInfo.id, updateProduct: updateProduct };
       }
      ),
      debounceTime(1000),
      switchMap((product) => {
        if (!product.updateProduct) return of(null);
        return this.productService.updateProductFromCart(product.id, product.updateProduct).pipe(
          tap(() => {
            this.commonService.intermediateObservable.next(true);
          }),
          takeUntil(this.destroyed$),
          catchError((err) => {
            return of(err);
          })
        )
      }),
      takeUntil(this.destroyed$),
      catchError((err) => {
        return of(err);
      })
    ).subscribe();
  }

  confirmDelete(id: number) {
    this.confirmationService.confirm({
        message: 'Bạn chắc chắn muốn bỏ sản phẩm này?',
        header: 'Xác nhận',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
          this.deleteProduct(id);
        },
        reject: () => {
        }
    });
  }

  confirmDeleteAll() {
    this.confirmationService.confirm({
        message: 'Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
        header: 'Xác nhận xóa',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
            this.deleteAllProducts();
        }
    });
  }

  confirmChangeOrder() {
    console.log('confirmChangeOrder called');
    this.confirmationService.confirm({
        message: 'Bạn đang có sản phẩm chưa thanh toán, có muốn thay thế không?',
        header: 'Xác nhận',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
          console.log('User accepted order change');
          localStorage.setItem("productOrder",JSON.stringify(this.productToOrder));
          console.log('New order saved, navigating to /order');
          this.router.navigate(['/order']);
        },
        reject: () => {
          console.log('User rejected order change');
        }
    });
  }

  resetTotalCost(){
    this.totalCost = 0;
      this.productsInCart.forEach((item) => {
        this.totalCost += item.products.price * item.quantity;
    })
  }

  deleteProduct(id: number){
    this.productService.deleteProductFromCart(id).pipe(
      tap(() => {
        this.productsInCart = this.productsInCart.filter(p => p.id !== id);
        this.resetTotalCost();
        this.commonService.intermediateObservable.next(true);
      }),
      takeUntil(this.destroyed$),
      catchError((err) => {
        this.toastService.fail('Xóa sản phẩm thất bại');
        return of(err);
      })
    ).subscribe();
  }

  deleteAllProducts() {
    const deleteRequests = this.productsInCart.map(item =>
        this.productService.deleteProductFromCart(item.id)
    );

    forkJoin(deleteRequests).pipe(
        tap(() => {
            this.productsInCart = [];
            this.productToOrder = [];
            this.resetTotalCost();
            this.commonService.intermediateObservable.next(true);
            this.toastService.success('Đã xóa tất cả sản phẩm');
        }),
        takeUntil(this.destroyed$),
        catchError((err) => {
            this.toastService.fail('Lỗi khi xóa sản phẩm');
            return of(err);
        })
    ).subscribe();
  }

  onCheckboxChange(event: any, cartId: number){
    console.log('Checkbox change event:', event, 'cartId:', cartId);
    const isChecked = event.checked;
    console.log('Is checked:', isChecked);

    if (isChecked){
      const product = this.productsInCart.find(item => item.id === cartId);
      console.log('Found product for selection:', product);
      if (product) {
        // Check if already added to avoid duplicates
        const exists = this.productToOrder.find(item => item.id === cartId);
        if (!exists) {
          this.productToOrder.push(product);
          console.log('Product added to order. Current productToOrder:', this.productToOrder);
        }
      }
    } else {
      this.productToOrder = this.productToOrder.filter(item => item.id !== cartId);
      console.log('Product removed from order. Current productToOrder:', this.productToOrder);
    }
  }

  isProductSelected(cartId: number): boolean {
    return this.productToOrder.some(item => item.id === cartId);
  }

  getSelectedProductsTotal(): number {
    return this.productToOrder.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  }

  sendProductToOrder(){
    console.log('sendProductToOrder called');
    console.log('productToOrder length:', this.productToOrder.length);
    console.log('productToOrder:', this.productToOrder);
    
    if (this.productToOrder.length === 0){
      console.log('No products selected, showing error toast');
      this.toastService.fail("Vui lòng chọn sản phẩm để thanh toán");
      return;
    } 
    
    try {
      const existingOrder = localStorage.getItem("productOrder");
      console.log('Existing order in localStorage:', existingOrder);
      
      if (existingOrder == null){
        console.log('No existing order, setting new order and navigating');
        localStorage.setItem("productOrder", JSON.stringify(this.productToOrder));
        console.log('Order saved to localStorage, navigating to /order');
        this.router.navigate(['/order']);
      } else {
        console.log('Existing order found, showing confirmation dialog');
        this.confirmChangeOrder();
      }
    } catch (error) {
      console.error('Error in sendProductToOrder:', error);
      this.toastService.fail("Có lỗi xảy ra, vui lòng thử lại");
    }
  }
}
