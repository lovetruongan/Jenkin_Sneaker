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
          <div class="card orders-today">
            <p-card header="Đơn hàng hôm nay" styleClass="stat-card stat-orders">
              <div class="card-content">
                <i class="pi pi-shopping-bag"></i>
                <h2>{{ ordersToday }}</h2>
              </div>
            </p-card>
          </div>
          <div class="card daily-revenue">
            <p-card header="Doanh thu hôm nay" styleClass="stat-card stat-daily-revenue">
              <div class="card-content">
                <i class="pi pi-money-bill"></i>
                <h2>{{ dailyRevenue | currency:'VND' }}</h2>
              </div>
            </p-card>
          </div>
          <div class="card total-products">
            <p-card header="Tổng sản phẩm" styleClass="stat-card stat-total-products">
              <div class="card-content">
                <i class="pi pi-box"></i>
                <h2>{{ totalProducts }}</h2>
              </div>
            </p-card>
          </div>
          <div class="card sold-products">
            <p-card header="Sản phẩm đã bán" styleClass="stat-card stat-sold-products">
              <div class="card-content">
                <i class="pi pi-shopping-cart"></i>
                <h2>{{ soldProducts }}</h2>
              </div>
            </p-card>
          </div>
          <div class="card available-products">
            <p-card header="Sản phẩm trong kho" styleClass="stat-card stat-available-products">
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
                    <label class="date-range-label">Chọn khoảng thời gian:</label>
                    <p-calendar [(ngModel)]="dateRange" 
                              selectionMode="range" 
                              [showButtonBar]="true" 
                              (onSelect)="onDateRangeSelect()"
                              styleClass="statistics-calendar"
                              appendTo="body"
                              [numberOfMonths]="1"
                              [touchUI]="true">
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
                    <label class="date-range-label">Chọn khoảng thời gian:</label>
                    <p-calendar [(ngModel)]="monthRange" 
                              selectionMode="range" 
                              view="month" 
                              [showButtonBar]="true" 
                              (onSelect)="onMonthRangeSelect()"
                              styleClass="statistics-calendar"
                              appendTo="body"
                              [numberOfMonths]="1"
                              [touchUI]="true">
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
                    <label class="date-range-label">Chọn khoảng thời gian:</label>
                    <p-calendar [(ngModel)]="yearRange" 
                              selectionMode="range" 
                              view="year" 
                              [showButtonBar]="true" 
                              (onSelect)="onYearRangeSelect()"
                              styleClass="statistics-calendar"
                              appendTo="body"
                              [numberOfMonths]="1"
                              [touchUI]="true">
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
        }

        h2 {
          margin: 0;
          font-size: 1.5rem;
        }
      }
    }

    .stat-orders .card-content i { color: #ff9800; }
    .stat-daily-revenue .card-content i { color: #4caf50; }
    .stat-total-products .card-content i { color: #2196f3; }
    .stat-sold-products .card-content i { color: #e91e63; }
    .stat-available-products .card-content i { color: #9c27b0; }

    .stat-orders .card-content h2 { color: #ff9800; }
    .stat-daily-revenue .card-content h2 { color: #4caf50; }
    .stat-total-products .card-content h2 { color: #2196f3; }
    .stat-sold-products .card-content h2 { color: #e91e63; }
    .stat-available-products .card-content h2 { color: #9c27b0; }

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
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 1rem;
    }

    .calendar-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      background: #f8f9fa;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid #e9ecef;

      .date-range-label {
        font-weight: 500;
        color: #333;
        white-space: nowrap;
        margin-right: 0.25rem;
      }

      :host ::ng-deep {
        .p-calendar {
          width: 320px;
          display: inline-block;

          .p-inputtext {
            width: 100%;
            padding: 0.5rem;
            border-radius: 6px;
            border: 1px solid #ddd;
            font-size: 14px;
            background: white;

            &:focus {
              outline: none;
              border-color: #1976d2;
              box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
            }
          }

          .p-datepicker {
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            background: white;
            padding: 0.5rem;

            .p-datepicker-header {
              padding: 0.5rem;
              border-bottom: 1px solid #eee;

              .p-datepicker-title {
                .p-datepicker-month,
                .p-datepicker-year {
                  font-weight: 500;
                  color: #333;
                }
              }

              .p-datepicker-prev,
              .p-datepicker-next {
                width: 2rem;
                height: 2rem;
                border-radius: 4px;
                transition: all 0.2s;

                &:hover {
                  background: #f0f0f0;
                }
              }
            }

            .p-datepicker-calendar {
              th {
                padding: 0.5rem;
                font-weight: 500;
                color: #666;
              }

              td {
                padding: 0.25rem;

                > span {
                  width: 2rem;
                  height: 2rem;
                  border-radius: 4px;
                  transition: all 0.2s;

                  &:hover {
                    background: #f0f0f0;
                  }

                  &.p-highlight {
                    background: #1976d2;
                    color: white;
                  }

                  &.p-datepicker-today {
                    background: #e3f2fd;
                    color: #1976d2;
                    font-weight: 500;
                  }
                }
              }
            }
          }

          .p-button {
            padding: 0.5rem 1rem;
            background-color: #1976d2;
            border: none;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            transition: all 0.2s ease;

            &:hover {
              background-color: #1565c0;
              transform: translateY(-1px);
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            &:active {
              transform: translateY(0);
            }
          }
        }
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

    :host ::ng-deep .p-datepicker {
      min-width: 220px !important;
      max-width: 340px !important;
      width: 100% !important;
      box-sizing: border-box;
      position: fixed !important;
      z-index: 9999 !important;
    }

    :host ::ng-deep .p-datepicker .p-datepicker-group {
      width: 100% !important;
      max-width: 320px !important;
    }

    :host ::ng-deep .p-datepicker .p-datepicker-multiple-month {
      display: block !important;
    }

    :host ::ng-deep .p-datepicker .p-datepicker-multiple-month .p-datepicker-group {
      width: 100% !important;
      margin: 0 !important;
    }

    @media (max-width: 768px) {
      :host ::ng-deep .p-datepicker {
        min-width: 280px !important;
        max-width: 300px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
    }

    .calendar-container {
      overflow: visible !important;
      position: relative !important;
    }

    .chart-container {
      overflow: visible !important;
      position: relative !important;
    }

    .revenue-statistics {
      overflow: visible !important;
      position: relative !important;
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
  ordersToday: number = 0;
  
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

    // Load today's orders
    this.statisticsService.getOrdersToday().subscribe(
      count => this.ordersToday = count
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