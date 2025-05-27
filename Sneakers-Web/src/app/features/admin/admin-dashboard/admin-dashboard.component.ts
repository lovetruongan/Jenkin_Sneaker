import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { StatisticsService, DailyRevenue, MonthlyRevenue, YearlyRevenue, ProductStatistics } from '../../../core/services/statistics.service';
import { Chart } from 'chart.js';
import { BestSellingStatisticsComponent } from '../../../best-selling-statistics/best-selling-statistics.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    CardModule,
    TabViewModule,
    CalendarModule,
    FormsModule,
    ButtonModule,
    TableModule,
    BestSellingStatisticsComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Thống kê tổng quan</h1>
      </div>

      <div class="dashboard-content">
        <!-- Statistics Cards -->
        <div class="statistics-cards">
          <div class="card daily-revenue">
            <p-card header="Doanh thu hôm nay" styleClass="stat-card">
              <div class="card-content">
                <i class="pi pi-money-bill"></i>
                <h2>{{ dailyRevenue | currency:'VND' }}</h2>
              </div>
            </p-card>
          </div>

          <div class="card total-products">
            <p-card header="Tổng sản phẩm" styleClass="stat-card">
              <div class="card-content">
                <i class="pi pi-box"></i>
                <h2>{{ totalProducts }}</h2>
              </div>
            </p-card>
          </div>

          <div class="card sold-products">
            <p-card header="Sản phẩm đã bán" styleClass="stat-card">
              <div class="card-content">
                <i class="pi pi-shopping-cart"></i>
                <h2>{{ soldProducts }}</h2>
              </div>
            </p-card>
          </div>

          <div class="card available-products">
            <p-card header="Sản phẩm trong kho" styleClass="stat-card">
              <div class="card-content">
                <i class="pi pi-inbox"></i>
                <h2>{{ availableProducts }}</h2>
              </div>
            </p-card>
          </div>
        </div>

        <!-- Revenue Statistics -->
        <div class="revenue-statistics">
          <p-card header="Thống kê doanh thu" styleClass="statistics-card">
            <p-tabView>
              <p-tabPanel header="Theo ngày">
                <div class="chart-container">
                  <div class="calendar-container">
                    <p-calendar [(ngModel)]="dateRange" 
                              selectionMode="range" 
                              [showButtonBar]="true" 
                              (onSelect)="onDateRangeSelect()"
                              styleClass="statistics-calendar">
                    </p-calendar>
                  </div>
                  <div class="chart-wrapper">
                    <canvas #dailyRevenueChart></canvas>
                  </div>
                </div>
              </p-tabPanel>
              <p-tabPanel header="Theo tháng">
                <div class="chart-container">
                  <div class="calendar-container">
                    <p-calendar [(ngModel)]="monthRange" 
                              selectionMode="range" 
                              view="month" 
                              [showButtonBar]="true" 
                              (onSelect)="onMonthRangeSelect()"
                              styleClass="statistics-calendar">
                    </p-calendar>
                  </div>
                  <div class="chart-wrapper">
                    <canvas #monthlyRevenueChart></canvas>
                  </div>
                </div>
              </p-tabPanel>
              <p-tabPanel header="Theo năm">
                <div class="chart-container">
                  <div class="calendar-container">
                    <p-calendar [(ngModel)]="yearRange" 
                              selectionMode="range" 
                              view="year" 
                              [showButtonBar]="true" 
                              (onSelect)="onYearRangeSelect()"
                              styleClass="statistics-calendar">
                    </p-calendar>
                  </div>
                  <div class="chart-wrapper">
                    <canvas #yearlyRevenueChart></canvas>
                  </div>
                </div>
              </p-tabPanel>
            </p-tabView>
          </p-card>
        </div>

        <!-- Best Selling Statistics -->
        <div class="best-selling-section">
          <p-card header="Thống kê sản phẩm bán chạy" styleClass="statistics-card">
            <app-best-selling-statistics></app-best-selling-statistics>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .dashboard-header h1 {
      color: #333;
      font-size: 2rem;
      font-weight: 600;
    }

    .statistics-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      height: 100%;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-5px);
      }

      .card-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;

        i {
          font-size: 2rem;
          color: #2196F3;
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
        }
      }
    }

    .revenue-statistics {
      margin-top: 2rem;
      margin-bottom: 2rem;
    }

    .best-selling-section {
      margin-top: 2rem;
      margin-bottom: 2rem;

      ::ng-deep {
        .best-selling-container {
          margin-top: 0;
          padding: 0;
        }

        .statistics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .statistics-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 1rem;
        }

        .controls {
          margin-bottom: 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;

          label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          input {
            padding: 0.25rem 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
          }

          button {
            padding: 0.5rem 1rem;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background-color: #1976D2;
            }
          }
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;

          th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #eee;
          }

          th {
            background-color: #f5f5f5;
            font-weight: 600;
          }

          tbody tr:hover {
            background-color: #f8f9fa;
          }
        }
      }
    }

    .statistics-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .chart-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
      padding: 1rem;
    }

    .calendar-container {
      .statistics-calendar {
        width: 100%;
      }
    }

    .chart-wrapper {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);

      canvas {
        width: 100% !important;
        height: 300px !important;
      }
    }

    :host ::ng-deep {
      .p-card {
        .p-card-body {
          padding: 1rem;
        }
      }

      .p-tabview {
        .p-tabview-nav {
          border-bottom: 2px solid #e9ecef;
          
          li {
            .p-tabview-nav-link {
              padding: 1rem 1.5rem;
              color: #495057;
              font-weight: 500;
              
              &:hover {
                color: #2196F3;
              }
            }
            
            &.p-highlight {
              .p-tabview-nav-link {
                color: #2196F3;
                border-color: #2196F3;
              }
            }
          }
        }
      }
    }

    @media screen and (max-width: 768px) {
      .chart-container {
        grid-template-columns: 1fr;
      }

      .statistics-cards {
        grid-template-columns: 1fr;
      }

      .best-selling-section {
        ::ng-deep {
          .statistics-grid {
            grid-template-columns: 1fr;
          }
        }
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('dailyRevenueChart') dailyRevenueChartRef!: ElementRef;
  @ViewChild('monthlyRevenueChart') monthlyRevenueChartRef!: ElementRef;
  @ViewChild('yearlyRevenueChart') yearlyRevenueChartRef!: ElementRef;

  dailyRevenue: number = 0;
  totalProducts: number = 0;
  soldProducts: number = 0;
  availableProducts: number = 0;
  
  dateRange: Date[] = [];
  monthRange: Date[] = [];
  yearRange: Date[] = [];

  private dailyChart: Chart | null = null;
  private monthlyChart: Chart | null = null;
  private yearlyChart: Chart | null = null;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load daily revenue
    this.statisticsService.getDailyRevenue().subscribe(
      revenue => this.dailyRevenue = revenue
    );

    // Load product statistics
    this.statisticsService.getProductStatistics().subscribe(
      stats => {
        this.totalProducts = stats.totalProducts;
        this.soldProducts = stats.soldProducts;
        this.availableProducts = stats.availableProducts;
      }
    );
  }

  onDateRangeSelect() {
    if (this.dateRange.length === 2) {
      const startDate = this.dateRange[0].toISOString().split('T')[0];
      const endDate = this.dateRange[1].toISOString().split('T')[0];
      
      this.statisticsService.getRevenueByDateRange(startDate, endDate).subscribe(
        data => this.updateDailyChart(data)
      );
    }
  }

  onMonthRangeSelect() {
    if (this.monthRange.length === 2) {
      const startMonth = this.monthRange[0].toISOString().slice(0, 7);
      const endMonth = this.monthRange[1].toISOString().slice(0, 7);
      
      this.statisticsService.getRevenueByMonthRange(startMonth, endMonth).subscribe(
        data => this.updateMonthlyChart(data)
      );
    }
  }

  onYearRangeSelect() {
    if (this.yearRange.length === 2) {
      const startYear = this.yearRange[0].getFullYear().toString();
      const endYear = this.yearRange[1].getFullYear().toString();
      
      this.statisticsService.getRevenueByYearRange(startYear, endYear).subscribe(
        data => this.updateYearlyChart(data)
      );
    }
  }

  private updateDailyChart(data: DailyRevenue[]) {
    const ctx = this.dailyRevenueChartRef.nativeElement.getContext('2d');
    if (this.dailyChart) {
      this.dailyChart.destroy();
    }
    
    this.dailyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item.date),
        datasets: [{
          label: 'Doanh thu theo ngày',
          data: data.map(item => item.revenue),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Biểu đồ doanh thu theo ngày'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString('vi-VN') + ' VND';
              }
            }
          }
        }
      }
    });
  }

  private updateMonthlyChart(data: MonthlyRevenue[]) {
    const ctx = this.monthlyRevenueChartRef.nativeElement.getContext('2d');
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }
    
    this.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.month),
        datasets: [{
          label: 'Doanh thu theo tháng',
          data: data.map(item => item.revenue),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Biểu đồ doanh thu theo tháng'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString('vi-VN') + ' VND';
              }
            }
          }
        }
      }
    });
  }

  private updateYearlyChart(data: YearlyRevenue[]) {
    const ctx = this.yearlyRevenueChartRef.nativeElement.getContext('2d');
    if (this.yearlyChart) {
      this.yearlyChart.destroy();
    }
    
    this.yearlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.year),
        datasets: [{
          label: 'Doanh thu theo năm',
          data: data.map(item => item.revenue),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Biểu đồ doanh thu theo năm'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString('vi-VN') + ' VND';
              }
            }
          }
        }
      }
    });
  }
} 