import { Component, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { ProductService } from '../../../core/services/product.service';
import { ProductDto } from '../../../core/dtos/product.dto';
import { catchError, filter, tap, of, map } from 'rxjs';
import { AllProductDto } from '../../../core/dtos/AllProduct.dto';
import { environment } from '../../../../environments/environment.development';
import { CurrencyPipe } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { Router, RouterModule } from '@angular/router';

import { RecommendationService } from '../../../core/services/recommendation.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { CategoryDto } from '../../../core/dtos/Category.dto';
import { VoucherDisplayComponent } from '../voucher-display/voucher-display.component';

import { AiChatbotComponent } from '../../../core/components/ai-chatbot/ai-chatbot.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselModule,
    CurrencyPipe,
    BadgeModule,
    RouterModule,
    AiChatbotComponent,
    VoucherDisplayComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponent implements OnInit {
  public products: ProductDto[] = [];
  public productsHighlight: ProductDto[] = [];
  public productNewest: ProductDto[] = [];
  public productsDiscount: ProductDto[] = [];
  public recommendedProducts: ProductDto[] = [];
  public apiImage: string = environment.apiImage;
  public categories: CategoryDto[] = [];

  constructor(
    private productService: ProductService,
    private recommendationService: RecommendationService,
    private categoriesService: CategoriesService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getAllProduct().pipe(
      catchError((error) => {
        console.error('Error loading products:', error);
        return of({ products: [], totalProducts: 0 } as AllProductDto);
      }),
      filter((product: AllProductDto) => !!product),
      tap((product: AllProductDto) => {
        this.products = product.products || [];
        this.productsHighlight = this.products.slice(0, 3);
        this.productNewest = this.products.slice(0, 4);
        this.productsDiscount = this.products.filter((product) => {
          return product.discount && product.discount > 0;
        });
        this.loadRecommendedProducts();
      })
    ).subscribe();
  }

  loadCategories(): void {
    this.categoriesService.getCategories().pipe(
      filter((categories: CategoryDto[]) => !!categories),
      tap((categories: CategoryDto[]) => {
        this.categories = categories;
      })
    ).subscribe();
  }

  loadRecommendedProducts(): void {
    if (!this.products.length) {
      return;
    }

    this.recommendationService.getRecommendations(this.products).pipe(
      filter((products: ProductDto[]) => !!products),
      tap((products: ProductDto[]) => {
        this.recommendedProducts = products;
      })
    ).subscribe();
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/detailProduct', id]);
  }

  getProductImageUrl(product: ProductDto): string {
    return `${this.apiImage}${product.thumbnail}`;
  }
}
