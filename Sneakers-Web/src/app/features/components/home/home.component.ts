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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselModule,
    CurrencyPipe,
    BadgeModule,
    RouterModule
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

  constructor(
    private productService: ProductService,
    private recommendationService: RecommendationService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadRecommendedProducts();
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
      })
    ).subscribe();
  }

  loadRecommendedProducts(): void {
    this.recommendationService.getRecommendedProducts().pipe(
      catchError(error => {
        console.error('Error loading recommended products:', error);
        // Return a subset of regular products as fallback
        return this.productService.getAllProduct().pipe(
          map(response => {
            const products = response.products || [];
            // Mix of discounted and newest products as fallback
            const discounted = products.filter(p => p.discount && p.discount > 0).slice(0, 4);
            const newest = products.slice(0, 4);
            return [...new Set([...discounted, ...newest])].slice(0, 8);
          }),
          catchError(() => of([]))
        );
      }),
      tap(products => {
        this.recommendedProducts = products;
      })
    ).subscribe();
  }

  navigateToDetail(id: number) {
    this.router.navigate(['/detailProduct', id]);
  }

  getProductImageUrl(product: ProductDto): string {
    return `${this.apiImage}${product.thumbnail}`;
  }
}
