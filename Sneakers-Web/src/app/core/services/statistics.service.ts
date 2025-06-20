import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface TodayOverview {
  ordersToday: number;
  revenueToday: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface YearlyRevenue {
  year: string;
  revenue: number;
}

export interface ProductStatistics {
  totalProducts: number;
  soldProducts: number;
  availableProducts: number;
}

export interface BrandSoldStatistics {
  brandId: number;
  brandName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface ProductSoldStatistics {
  productId: number;
  productName: string;
  totalSold: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTodayOverview(): Observable<TodayOverview> {
    return this.http.get<TodayOverview>(`${this.apiUrl}/statistics/today-overview`);
  }

  getDailyRevenue(date: string): Observable<DailyRevenue> {
    return this.http.get<DailyRevenue>(`${this.apiUrl}/statistics/daily-revenue/${date}`);
  }

  getRevenueByDateRange(startDate: string, endDate: string): Observable<DailyRevenue[]> {
    return this.http.get<any[]>(`${this.apiUrl}/statistics/revenue-by-date-range`, {
      params: { startDate, endDate }
    }).pipe(
      map(data => data.map(item => ({
        date: item.date,
        revenue: item.revenue
      })))
    );
  }

  getRevenueByMonthRange(startMonth: string, endMonth: string): Observable<MonthlyRevenue[]> {
    return this.http.get<any[]>(`${this.apiUrl}/statistics/revenue-by-month-range`, {
      params: { startMonth, endMonth }
    }).pipe(
      map(data => data.map(item => ({
        month: item.month,
        revenue: item.revenue
      })))
    );
  }

  getRevenueByYearRange(startYear: string, endYear: string): Observable<YearlyRevenue[]> {
    return this.http.get<any[]>(`${this.apiUrl}/statistics/revenue-by-year-range`, {
      params: { startYear, endYear }
    }).pipe(
      map(data => data.map(item => ({
        year: item.year,
        revenue: item.revenue
      })))
    );
  }

  getProductStatistics(): Observable<ProductStatistics> {
    return this.http.get<any>(`${this.apiUrl}/statistics/product-statistics`).pipe(
      map(response => ({
        totalProducts: response.totalProducts,
        soldProducts: response.soldProducts,
        availableProducts: response.availableProducts
      }))
    );
  }

  getTopBrandsSold(topN: number = 10, startDate?: string, endDate?: string): Observable<BrandSoldStatistics[]> {
    let params: any = { topN };
    if (startDate && endDate) {
      params = { ...params, startDate, endDate };
    }
    return this.http.get<BrandSoldStatistics[]>(`${this.apiUrl}/statistics/top-brands-sold`, { params });
  }

  getOrdersToday(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/statistics/orders-today`);
  }

  getTopProductsSold(topN: number = 10, startDate?: string, endDate?: string): Observable<ProductSoldStatistics[]> {
    let params: any = { topN };
    if (startDate && endDate) {
      params = { ...params, startDate, endDate };
    }
    return this.http.get<ProductSoldStatistics[]>(`${this.apiUrl}/statistics/top-product-sold`, { params });
  }
} 