import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductSoldStatisticsDTO {
  productId: number;
  productName: string;
  totalSold: number;
}

interface BrandSoldStatisticsDTO {
  brandId: number;
  brandName: string;
  totalSold: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-best-selling-statistics',
  templateUrl: './best-selling-statistics.component.html',
  styleUrls: ['./best-selling-statistics.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe]
})
export class BestSellingStatisticsComponent implements OnInit {
  topProducts: ProductSoldStatisticsDTO[] = [];
  topBrands: BrandSoldStatisticsDTO[] = [];
  loading = false;
  topN = 10;

  private readonly apiUrl = '/api/v1/statistics';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTopProducts();
    this.fetchTopBrands();
  }

  fetchTopProducts() {
    this.loading = true;
    this.http.get<ProductSoldStatisticsDTO[]>(`${this.apiUrl}/top-product-sold`, {
      params: { topN: this.topN }
    }).subscribe({
      next: data => {
        this.topProducts = data;
        this.loading = false;
      },
      error: () => {
        this.topProducts = [];
        this.loading = false;
      }
    });
  }

  fetchTopBrands() {
    this.loading = true;
    this.http.get<BrandSoldStatisticsDTO[]>(`${this.apiUrl}/top-brands-sold`, {
      params: { topN: this.topN }
    }).subscribe({
      next: data => {
        this.topBrands = data;
        this.loading = false;
      },
      error: () => {
        this.topBrands = [];
        this.loading = false;
      }
    });
  }

  updateStatistics() {
    this.fetchTopProducts();
    this.fetchTopBrands();
  }
} 