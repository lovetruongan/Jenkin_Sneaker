import { AfterViewInit, Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterModule } from '@angular/router';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BaseComponent } from '../../commonComponent/base.component';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserService } from '../../services/user.service';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap, takeUntil, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../services/toast.service';
import { DetailProductService } from '../../services/detail-product.service';
import { FormsModule } from "@angular/forms";
import { ProductService } from '../../services/product.service';
import { ProductFromCartDto } from '../../dtos/ProductFromCart.dto';
import { BadgeModule } from 'primeng/badge';
import { ProductsInCartDto } from '../../dtos/productsInCart.dto';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { ToastModule } from 'primeng/toast';
import { CommonService } from '../../services/common.service';
import { environment } from '../../../../environments/environment.development';
import { UserDto } from '../../dtos/user.dto';
import { Subject } from 'rxjs';
import { ProductDto } from '../../dtos/product.dto';
import { AllProductDto } from '../../dtos/AllProduct.dto';

@Component({
  selector: 'app-app-header',
  standalone: true,
  imports: [
    InputTextModule,
    RouterModule,
    OverlayPanelModule,
    AvatarModule,
    MenuModule,
    FormsModule,
    BadgeModule,
    CurrencyPipe,
    ButtonModule,
    CommonModule,
    DataViewModule,
    ToastModule
  ],
  providers: [
    MessageService,
    ToastService
  ],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent extends BaseComponent implements AfterViewInit,OnInit{
  public token: string | null = null;
  public roleId: number = 100;
  public itemsMenuAvatar: MenuItem[] | undefined;
  public userName : string | undefined;
  public searchValue : string = "";
  public quantityInCart: number = 0;
  public products: ProductsInCartDto[] = [];
  public showPreview: boolean = false;
  public showCartPreview: boolean = false;
  public apiImage: string = environment.apiImage;

  // Search suggestions properties
  public searchSuggestions: ProductDto[] = [];
  public showSuggestions: boolean = false;
  private searchSubject = new Subject<string>();

  constructor(
    private userService : UserService,
    private router : Router,
    private readonly messageService: MessageService,
    private toastService: ToastService,
    private detailProductService : DetailProductService,
    private productService: ProductService,
    private commonService: CommonService
  ) {
    super();
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
      this.roleId = parseInt(JSON.parse(localStorage.getItem("userInfor") || '{"role_id": "0"}').role_id || '0');
    }

    // Setup search suggestions with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        if (searchTerm.trim().length >= 2) {
          return this.productService.searchProduct(searchTerm).pipe(
            tap(result => {
              // Extract products array from AllProductDto
              this.searchSuggestions = result.products ? result.products.slice(0, 5) : [];
            }),
            switchMap(() => of(this.searchSuggestions)),
            catchError(() => of([]))
          );
        }
        return of([]);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  ngOnInit(): void {
    this.detailProductService.quantityProductsInCart.pipe(
      filter((quantity : number) => !!quantity),
      tap((quantity : number) => {
        this.quantityInCart = quantity;
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    if (this.token != null){
      this.userService.getInforUser(this.token).pipe(
        filter((userInfo: UserDto) => !!userInfo),
        tap((userInfo: UserDto) => {
          this.userName = userInfo.fullname;
          this.roleId = userInfo.role.id;
        }),
        takeUntil(this.destroyed$),
        catchError((err) => of(err))
      ).subscribe()

      this.getCart().subscribe();
    }

    this.itemsMenuAvatar = [
      {
        label: 'Hồ sơ',
        icon: 'pi pi-user'
      },
      {
        label: 'Lịch sử mua',
        icon: 'pi pi-history',
        command: () => {
          this.goToHistory();
        }
      },
      {
        label: 'Trả hàng của tôi',
        icon: 'pi pi-replay',
        command: () => {
          this.goToMyReturns();
        }
      },
      {
        label: 'Sign out',
        icon: 'pi pi-power-off',
        command: () => {
          this.signOut();
        }
      }
    ]   
  }

  ngAfterViewInit(): void {
    this.commonService.intermediateObservable.pipe(
      switchMap(() => {
        return this.getCart();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }
  
  signOut(){
    localStorage.removeItem("token");
    localStorage.removeItem("roleId");
    localStorage.removeItem("userInfor");
    localStorage.removeItem("productOrder");
    window.location.href = "/Home";
  }

  sendContentSearch(){
    this.detailProductService.setContent(this.searchValue);
    this.hideSuggestions();
  }

  // Search suggestions methods
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.searchValue = value;
    
    if (value.trim().length >= 2) {
      this.searchSubject.next(value);
      this.showSuggestions = true;
    } else {
      this.searchSuggestions = [];
      this.showSuggestions = false;
    }
  }

  selectProduct(product: ProductDto): void {
    this.router.navigate(['/detailProduct', product.id]);
    this.searchValue = '';
    this.hideSuggestions();
  }

  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
      this.searchSuggestions = [];
    }, 150);
  }

  deleteProduct(event: any, id: number){
    event.stopPropagation();
    this.productService.deleteProductFromCart(id).pipe(
      switchMap(() => {
        this.commonService.intermediateObservable.next(true);
        return this.getCart();
      }),
      takeUntil(this.destroyed$),
      catchError((err) => {
        this.toastService.fail("Xóa sản phẩm thất bại");
        return of(err);
      })
    ).subscribe();
  }

  getCart(){
    return this.productService.getProductFromCart().pipe(
      filter((product : ProductFromCartDto) => !!product),
      tap((product : ProductFromCartDto) => {
        this.quantityInCart = product.totalCartItems;
        this.products = product.carts;
      }),
      takeUntil(this.destroyed$),
      catchError((err) => of(err))
    )
  }

  goToHistory(){
    this.router.navigate(['/history']);
  }

  goToMyReturns(){
    this.router.navigate(['/my-returns']);
  }
}
