import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ProductSoldStatisticsDTO {
  productId: number;
  productName: string;
  totalSold: number;
}

@Component({
  selector: 'app-statistics-product',
  templateUrl: './statistics-product.component.html',
  styleUrls: ['./statistics-product.component.scss'],
  standalone: true
})
export class StatisticsProductComponent {
  mode = 'date';
  selectedDate: string = '';
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  topN: number = 10;

  statistics: ProductSoldStatisticsDTO[] = [];
  loading = false;

  private readonly apiUrl = '/api/v1/statistics';

  constructor(private http: HttpClient) {}

  fetchByDate() {
    if (!this.selectedDate) return;
    this.loading = true;
    this.http.get<ProductSoldStatisticsDTO[]>(`${this.apiUrl}/product-sold-by-date`, {
      params: { date: this.selectedDate }
    }).subscribe({
      next: data => { this.statistics = data; this.loading = false; },
      error: () => { this.statistics = []; this.loading = false; }
    });
  }

  fetchByMonth() {
    if (!this.selectedYear || !this.selectedMonth) return;
    this.loading = true;
    this.http.get<ProductSoldStatisticsDTO[]>(`${this.apiUrl}/product-sold-by-month`, {
      params: { year: this.selectedYear, month: this.selectedMonth }
    }).subscribe({
      next: data => { this.statistics = data; this.loading = false; },
      error: () => { this.statistics = []; this.loading = false; }
    });
  }

  fetchByYear() {
    if (!this.selectedYear) return;
    this.loading = true;
    this.http.get<ProductSoldStatisticsDTO[]>(`${this.apiUrl}/product-sold-by-year`, {
      params: { year: this.selectedYear }
    }).subscribe({
      next: data => { this.statistics = data; this.loading = false; },
      error: () => { this.statistics = []; this.loading = false; }
    });
  }

  fetchTop() {
    if (!this.topN) return;
    this.loading = true;
    this.http.get<ProductSoldStatisticsDTO[]>(`${this.apiUrl}/top-product-sold`, {
      params: { topN: this.topN }
    }).subscribe({
      next: data => { this.statistics = data; this.loading = false; },
      error: () => { this.statistics = []; this.loading = false; }
    });
  }
} 