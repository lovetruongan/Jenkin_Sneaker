import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { ProductService } from '../../../core/services/product.service';
import { Subject, catchError, debounceTime, filter, map, of, switchMap, take, takeUntil, tap } from 'rxjs';
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
    ToastModule
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
  public producsInCart : ProductsInCartDto[] = [];
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
        this.producsInCart = product.carts;
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
            this.producsInCart = product.carts;
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
        this.producsInCart.forEach((product) => {
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
          this.productService.deleteProductFromCart(id).pipe(
            switchMap(() => {
              return this.productService.getProductFromCart().pipe(
                filter((product : ProductFromCartDto) => !!product),
                tap((product : ProductFromCartDto) => {
                  this.producsInCart = product.carts;
                  this.resetTotalCost();
                }),
                takeUntil(this.destroyed$),
                catchError((err) => of(err))
              );
            }),
            takeUntil(this.destroyed$),
            catchError((err) => {
              return of(err);
            })
          ).subscribe();
        },
        reject: () => {
        }
    });
  }

  confirmChangeOrder() {
    this.confirmationService.confirm({
        message: 'Bạn đang có sản phẩm chưa thanh toán, có muốn thay thế không?',
        header: 'Xác nhận',
        icon: 'pi pi-exclamation-triangle',
        acceptIcon:"none",
        rejectIcon:"none",
        rejectButtonStyleClass:"p-button-text",
        accept: () => {
          localStorage.setItem("productOrder",JSON.stringify(this.productToOrder));
          this.router.navigate(['/order']);
        },
        reject: () => {
          
        }
    });
  }

  resetTotalCost(){
    this.totalCost = 0;
      this.producsInCart.forEach((item) => {
        this.totalCost += item.products.price * item.quantity;
    })
  }

  deleteProduct(id: number){
    this.commonService.intermediateObservable.next(true);
    this.productService.deleteProductFromCart(id).pipe(
      switchMap(() => {
        return this.productService.getProductFromCart().pipe(
          filter((product : ProductFromCartDto) => !!product),
          tap((product : ProductFromCartDto) => {
            this.producsInCart = product.carts;
            this.resetTotalCost();
          }),
          takeUntil(this.destroyed$),
          catchError((err) => of(err))
        );
      }),
      takeUntil(this.destroyed$),
      catchError((err) => {
        return of(err);
      })
    ).subscribe();
  }

  onCheckboxChange(event : any, cartId: number){
    if (event.target.checked){
      this.producsInCart.forEach((item) => {
        if (item.id === cartId){
          this.productToOrder.push(item);
          return;
        }
      })
    } else {
      this.productToOrder = this.productToOrder.filter((item) => item.id !== cartId);
    }
  }

  sendProductToOrder(){
    if (this.productToOrder.length === 0){
      this.toastService.fail("Vui lòng chọn sản phẩm để thanh toán");
    } else {
      if (localStorage.getItem("productOrder") == null){
        localStorage.setItem("productOrder",JSON.stringify(this.productToOrder));
        this.router.navigate(['/order']);
      } else {
        this.confirmChangeOrder();
      }
    }
  }

  backToAll(){
    this.router.navigate(['/allProduct']);
  }
}
