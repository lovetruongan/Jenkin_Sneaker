import { Component, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { ProductService } from '../../../core/services/product.service';
import { ProductDto } from '../../../core/dtos/product.dto';
import { catchError, filter, tap, of } from 'rxjs';
import { AllProductDto } from '../../../core/dtos/AllProduct.dto';
import { environment } from '../../../../environments/environment.development';
import { CurrencyPipe } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { Router, RouterModule } from '@angular/router';

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
  public apiImage: string = environment.apiImage;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProduct().pipe(
      catchError((error) => {
        console.error('Error loading products:', error);
        // Return mock data when API fails
        return this.getMockData();
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

  private getMockData() {
    console.log('Loading mock data due to API error...');
    const mockProducts: ProductDto[] = [
      {
        id: 1,
        name: 'Nike Air Max 270',
        price: 2500000,
        discount: 15,
        thumbnail: 'assets/images/bannerGiay.jpg',
        description: 'Giày thể thao Nike Air Max 270 với thiết kế hiện đại',
        category_id: 1,
        product_images: []
      },
      {
        id: 2,
        name: 'Adidas Ultraboost 22',
        price: 3200000,
        discount: 20,
        thumbnail: 'assets/images/bannerGiay2.jpg',
        description: 'Giày chạy bộ Adidas Ultraboost với công nghệ Boost',
        category_id: 1,
        product_images: []
      },
      {
        id: 3,
        name: 'Converse Chuck Taylor',
        price: 1800000,
        discount: 0,
        thumbnail: 'assets/images/bannerGiay3.jpg',
        description: 'Giày Converse Chuck Taylor All Star classic',
        category_id: 2,
        product_images: []
      },
      {
        id: 4,
        name: 'Vans Old Skool',
        price: 2100000,
        discount: 10,
        thumbnail: 'assets/images/bannerGiay.jpg',
        description: 'Giày Vans Old Skool với thiết kế iconic',
        category_id: 2,
        product_images: []
      },
      {
        id: 5,
        name: 'Puma RS-X',
        price: 2800000,
        discount: 25,
        thumbnail: 'assets/images/bannerGiay2.jpg',
        description: 'Giày Puma RS-X với phong cách retro-futuristic',
        category_id: 1,
        product_images: []
      },
      {
        id: 6,
        name: 'New Balance 990v5',
        price: 4200000,
        discount: 0,
        thumbnail: 'assets/images/bannerGiay3.jpg',
        description: 'Giày New Balance 990v5 premium made in USA',
        category_id: 1,
        product_images: []
      }
    ];

    return of({
      products: mockProducts,
      totalProducts: mockProducts.length
    } as AllProductDto);
  }

  navigateToDetail(productId: number) {
    this.router.navigate(['/detailProduct', productId]);
  }

  getProductImageUrl(product: ProductDto): string {
    // If product has a thumbnail, use it
    if (product.thumbnail && product.thumbnail.trim() !== '') {
      return product.thumbnail.startsWith('assets/') ? product.thumbnail : (this.apiImage + product.thumbnail);
    }
    
    // If no thumbnail but has product_images, use the first one
    if (product.product_images && product.product_images.length > 0) {
      return this.apiImage + product.product_images[0].image_url;
    }
    
    // Default image if no images available
    return this.apiImage + 'notfound.jpg';
  }
}
