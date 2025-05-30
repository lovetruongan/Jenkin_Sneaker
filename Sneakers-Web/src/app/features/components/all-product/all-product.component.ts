import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { ProductService } from '../../../core/services/product.service';
import { catchError, filter, finalize, of, switchMap, takeUntil, tap } from 'rxjs';
import { ProductDto } from '../../../core/dtos/product.dto';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { MenuItem } from 'primeng/api';
import { FormsModule } from "@angular/forms";
import { DetailProductService } from '../../../core/services/detail-product.service';
import { Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { AllProductDto } from '../../../core/dtos/AllProduct.dto';
import { CurrencyPipe } from '@angular/common';
import { SliderModule } from 'primeng/slider';
import { environment } from '../../../../environments/environment.development';
import { BadgeModule } from 'primeng/badge';
import { CategoriesService } from '../../../core/services/categories.service';
import { CategoriesDto } from '../../../core/dtos/categories.dto';
import { UserService } from '../../../core/services/user.service';
import { UserDto } from '../../../core/dtos/user.dto';

@Component({
  selector: 'app-all-product',
  standalone: true,
  imports: [
    DataViewModule,
    DropdownModule,
    FormsModule,
    PaginatorModule,
    CurrencyPipe,
    SliderModule,
    BadgeModule
  ],
  templateUrl: './all-product.component.html',
  styleUrl: './all-product.component.scss'
})
export class AllProductComponent extends BaseComponent implements OnInit, AfterViewInit {
  private token: string | null = null;
  public roleId!: number;
  public products: ProductDto[] = [];
  public sortOptions: MenuItem[] = [
    { label: 'Giá từ thấp đến cao', value: 'price' },
    { label: 'Giá từ cao đến thấp', value: '!price' },
  ];
  public categoriesOptions: MenuItem[] = [];
  public productsHighlight: ProductDto[] = [];
  public sortOrder!: number;
  public sortField!: string;
  public priceFilterValue: number[] = [1, 100];
  public apiImage: string = environment.apiImage;
  public isLoading: boolean = false;
  public error: string | null = null;

  // Thêm các biến cho bộ lọc thương hiệu
  public brandOptions = [
    { label: 'Nike', value: 'nike' },
    { label: 'Adidas', value: 'adidas' },
    { label: 'Puma', value: 'puma' },
    { label: 'Converse', value: 'converse' },
    { label: 'Vans', value: 'vans' }
  ];
  public selectedBrands: string[] = [];
  private allProducts: ProductDto[] = []; // Lưu trữ tất cả sản phẩm trước khi lọc

  constructor(
    private productService: ProductService,
    private detailProductService: DetailProductService,
    private router: Router,
    private categoriesService: CategoriesService,
    private userService: UserService
  ) {
    super();
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  ngAfterViewInit(): void {
    this.detailProductService.content.pipe(
      filter((searchContent) => !!searchContent),
      switchMap((searchContent) => {
        return this.productService.searchProduct(searchContent).pipe(
          filter((product : AllProductDto) => !!product),
          tap((product: AllProductDto) => {
            this.products = product.products;
            this.productsHighlight = product.products.slice(0, 5);
          }),
        )
      }),
    ).subscribe();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Kiểm tra role user
    if (this.token != null) {
      this.userService.getInforUser(this.token).pipe(
        filter((userInfor: UserDto) => !!userInfor),
        tap((userInfor: UserDto) => {
          this.roleId = userInfor.role.id;
        })
      ).subscribe();
    }

    // Tải danh mục sản phẩm
    this.categoriesService.getCategories().pipe(
      tap((categories) => {
        this.categoriesOptions = categories.map((item: CategoriesDto) => {
          return {
            label: item.name,
            value: item.id.toString()
          }
        })
      })
    ).subscribe();

    // Tải sản phẩm theo khoảng giá mặc định
    this.filterPrice();
  }

  onBrandChange(event: any, brandValue: string) {
    if (event.target.checked) {
      this.selectedBrands.push(brandValue);
    } else {
      this.selectedBrands = this.selectedBrands.filter(b => b !== brandValue);
    }
    this.filterProducts();
  }

  filterProducts() {
    let filteredProducts = [...this.allProducts];

    // Lọc theo thương hiệu nếu có chọn
    if (this.selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        this.selectedBrands.some(brand => 
          product.name.toLowerCase().includes(brand.toLowerCase())
        )
      );
    }

    // Lọc theo giá
    filteredProducts = filteredProducts.filter(product => 
      product.price >= this.priceFilterValue[0] * 500000 &&
      product.price <= this.priceFilterValue[1] * 500000
    );

    this.products = filteredProducts;
    this.productsHighlight = filteredProducts.slice(0, 5);
  }

  onSortChange(event: any) {
    let value = event.value;
    if (value.indexOf("!") === 0) {
      this.sortOrder = -1;
      this.sortField = value.substring(1, value.length);
    } else {
      this.sortOrder = 1;
      this.sortField = value;
    }
  }

  onCategoryChange(event: any){
    this.isLoading = true;
    this.categoriesService.getAllProductByCategory(event.value).pipe(
      takeUntil(this.destroyed$),
      tap((productByCategory: AllProductDto) => {
        if (productByCategory && productByCategory.products) {
          this.products = productByCategory.products;
          this.productsHighlight = productByCategory.products.slice(0, 5);
          this.error = null;
        } else {
          this.error = 'Không có sản phẩm nào trong danh mục này';
        }
      }),
      catchError((error) => {
        console.error('Error loading category products:', error);
        this.error = 'Có lỗi xảy ra khi tải sản phẩm theo danh mục';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe();
  }

  navigateToDetail(productId: number) {
    this.detailProductService.setId(productId);
    this.router.navigateByUrl(`/detailProduct/${productId}`);
  }

  filterPrice() {
    this.isLoading = true;
    this.productService.getProductViaPrice(this.priceFilterValue[0] * 500000, this.priceFilterValue[1] * 500000).pipe(
      takeUntil(this.destroyed$),
      tap((product: AllProductDto) => {
        if (product && product.products) {
          this.products = product.products;
          this.productsHighlight = product.products.slice(0, 5);
          this.error = null;
        } else {
          this.error = 'Không tìm thấy sản phẩm trong khoảng giá này';
        }
      }),
      catchError((error) => {
        console.error('Error filtering products by price:', error);
        this.error = 'Có lỗi xảy ra khi lọc sản phẩm theo giá';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe();
  }
}
