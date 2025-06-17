import { Component, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { BaseComponent } from '../../../core/commonComponent/base.component';
import { ProductService } from '../../../core/services/product.service';
import { ProductDto } from '../../../core/dtos/product.dto';
import { filter, tap } from 'rxjs';
import { AllProductDto } from '../../../core/dtos/AllProduct.dto';
import { environment } from '../../../../environments/environment.development';
import { CurrencyPipe } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CarouselModule,
    CurrencyPipe,
    BadgeModule
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
    this.productService.getAllProduct().pipe(
      filter((product: AllProductDto) => !!product),
      tap((product: AllProductDto) => {
        this.products = product.products;
        this.productsHighlight = product.products.slice(0, 3);
        this.productNewest  = product.products.slice(0, 4);
        this.productsDiscount = product.products.filter((product) => {
          return product.discount;
        })
      }),
    ).subscribe();

  }

  navigateToDetail(productId: number){
    this.router.navigateByUrl(`/detailProduct/${productId}`);
  }
}
