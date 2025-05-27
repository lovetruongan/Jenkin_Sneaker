import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { StatisticsService, BrandSoldStatistics, ProductSoldStatistics } from '../core/services/statistics.service';

@Component({
  selector: 'app-best-selling-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, CalendarModule],
  templateUrl: './best-selling-statistics.component.html',
  styleUrls: ['./best-selling-statistics.component.scss']
})
export class BestSellingStatisticsComponent implements OnInit {
  topN: number = 10;
  topProducts: ProductSoldStatistics[] = [];
  topBrands: BrandSoldStatistics[] = [];
  loading: boolean = false;
  dateRange: Date[] = [];

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit() {
    // Set default date range to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    this.dateRange = [startDate, endDate];
    this.updateStatistics();
  }

  onDateRangeSelect() {
    this.updateStatistics();
  }

  updateStatistics() {
    if (!this.dateRange || this.dateRange.length !== 2) {
      return;
    }

    this.loading = true;
    const startDate = this.dateRange[0].toISOString().split('T')[0];
    const endDate = this.dateRange[1].toISOString().split('T')[0];
    
    // Fetch both top products and top brands with date range
    Promise.all([
      this.statisticsService.getTopProductsSold(this.topN, startDate, endDate).toPromise(),
      this.statisticsService.getTopBrandsSold(this.topN, startDate, endDate).toPromise()
    ]).then(([products, brands]) => {
      this.topProducts = products || [];
      this.topBrands = brands || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error fetching statistics:', error);
      this.topProducts = [];
      this.topBrands = [];
      this.loading = false;
    });
  }
} 