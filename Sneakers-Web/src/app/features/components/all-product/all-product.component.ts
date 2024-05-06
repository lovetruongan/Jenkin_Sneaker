import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { ProductService } from '../../../core/services/product.service';
import { catchError, filter, of, switchMap, takeUntil, tap } from 'rxjs';
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

  constructor(
    private productService: ProductService,
    private detailProductService: DetailProductService,
    private router: Router,
    private categoriesService: CategoriesService
  ) {
    super();
  }
  ngAfterViewInit(): void {
    this.detailProductService.content.pipe(
      filter((searchContent) => !!searchContent),
      switchMap((searchContent) => {
        return this.productService.searchProduct(searchContent).pipe(
          filter((product : AllProductDto) => !!product),
          tap((product: AllProductDto) => {
            this.products = product.products;
          }),
        )
      }),
    ).subscribe();
  }

  ngOnInit(): void {
    this.categoriesService.getCategories().pipe(
      tap((categories) => {
        this.categoriesOptions = categories.map((item: CategoriesDto) => {
          return {
            label: item.name,
            value: item.id.toString()
          }
        })
      })
    ).subscribe()

    this.productService.getAllProduct().pipe(
      filter((product: AllProductDto) => !!product),
      tap((product: AllProductDto) => {
        this.products = product.products;
        this.productsHighlight = product.products.slice(0, 5);
      }),
    ).subscribe()
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
    this.categoriesService.getAllProductByCategory(event.value).pipe(
      filter((productByCategory: AllProductDto) => !!productByCategory),
      tap((productByCategory: AllProductDto) => {
        this.products = productByCategory.products;
      })
    ).subscribe();
  }

  navigateToDetail(productId: number) {
    this.detailProductService.setId(productId);
    this.router.navigateByUrl(`/detailProduct/${productId}`);
  }

  filterPrice() {
    this.productService.getProductViaPrice(this.priceFilterValue[0] * 500000, this.priceFilterValue[1] * 500000).pipe(
      filter((product: AllProductDto) => !!product),
      tap((product: AllProductDto) => {
        this.products = product.products;
      }),
      catchError((error) => {
        return of(error);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }
}
