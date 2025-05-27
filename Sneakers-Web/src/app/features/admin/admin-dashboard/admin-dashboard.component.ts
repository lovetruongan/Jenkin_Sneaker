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
import { Chart, registerables } from 'chart.js';
import { BestSellingStatisticsComponent } from '../../../best-selling-statistics/best-selling-statistics.component';
import { OrderService } from '../../../core/services/order.service';
import { PrimeNGConfig } from 'primeng/api';

// Register Chart.js components
Chart.register(...registerables);

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
          <div class="card total-revenue">
            <p-card styleClass="stat-card stat-total-revenue">
              <div class="card-content">
                <i class="pi pi-money-bill"></i>
                <div class="stat-info">
                  <h2>{{ totalRevenue | number:'1.0-0' }}</h2>
                  <div class="stat-label">Tổng doanh thu (VNĐ)</div>
                </div>
              </div>
            </p-card>
          </div>
          <div class="card orders-today">
            <p-card styleClass="stat-card stat-orders">
              <div class="card-content">
                <i class="pi pi-shopping-bag"></i>
                <div class="stat-info">
                  <h2>{{ ordersToday | number:'1.0-0' }}</h2>
                  <div class="stat-label">Đơn hàng hôm nay</div>
                </div>
              </div>
            </p-card>
          </div>
          <div class="card daily-revenue">
            <p-card styleClass="stat-card stat-daily-revenue">
              <div class="card-content">
                <i class="pi pi-chart-line"></i>
                <div class="stat-info">
                  <h2>{{ dailyRevenue | number:'1.0-0' }}</h2>
                  <div class="stat-label">Doanh thu hôm nay (VNĐ)</div>
                </div>
              </div>
            </p-card>
          </div>
          <div class="card total-products">
            <p-card styleClass="stat-card stat-total-products">
              <div class="card-content">
                <i class="pi pi-box"></i>
                <div class="stat-info">
                  <h2>{{ totalProducts | number:'1.0-0' }}</h2>
                  <div class="stat-label">Tổng sản phẩm</div>
                </div>
              </div>
            </p-card>
          </div>
          <div class="card sold-products">
            <p-card styleClass="stat-card stat-sold-products">
              <div class="card-content">
                <i class="pi pi-shopping-cart"></i>
                <div class="stat-info">
                  <h2>{{ soldProducts | number:'1.0-0' }}</h2>
                  <div class="stat-label">Sản phẩm đã bán</div>
                </div>
              </div>
            </p-card>
          </div>
          <div class="card available-products">
            <p-card styleClass="stat-card stat-available-products">
              <div class="card-content">
                <i class="pi pi-inbox"></i>
                <div class="stat-info">
                  <h2>{{ availableProducts | number:'1.0-0' }}</h2>
                  <div class="stat-label">Sản phẩm trong kho</div>
                </div>
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
                              [touchUI]="true"
                              [showIcon]="true"
                              [readonlyInput]="true"
                              [firstDayOfWeek]="1"
                              dateFormat="dd/mm/yy"
                              placeholder="Chọn ngày"
                              [showOtherMonths]="false"
                              [yearNavigator]="true"
                              [monthNavigator]="true"
                              yearRange="2000:2030">
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
                              [touchUI]="true"
                              [showIcon]="true"
                              [readonlyInput]="true"
                              dateFormat="mm/yy"
                              placeholder="Chọn tháng"
                              [yearNavigator]="true"
                              [monthNavigator]="true"
                              yearRange="2000:2030">
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
                              [touchUI]="true"
                              [showIcon]="true"
                              [readonlyInput]="true"
                              dateFormat="yy"
                              placeholder="Chọn năm"
                              [yearNavigator]="true"
                              yearRange="2000:2030">
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      height: 140px;
      border-radius: 12px;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .card-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem;
        height: 100%;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

        i {
          font-size: 2.5rem;
          margin-right: 1rem;
          opacity: 0.8;
        }

        .stat-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          h2 {
            margin: 0;
            font-size: 1.8rem;
            font-weight: 700;
            line-height: 1.2;
          }

          .stat-label {
            font-size: 0.9rem;
            color: #6c757d;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
      }
    }

    .stat-total-revenue {
      .card-content {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        
        i { color: rgba(255, 255, 255, 0.9); }
        .stat-label { color: rgba(255, 255, 255, 0.8); }
      }
    }

    .stat-orders {
      .card-content {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        
        i { color: rgba(255, 255, 255, 0.9); }
        .stat-label { color: rgba(255, 255, 255, 0.8); }
      }
    }

    .stat-daily-revenue {
      .card-content {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        
        i { color: rgba(255, 255, 255, 0.9); }
        .stat-label { color: rgba(255, 255, 255, 0.8); }
      }
    }

    .stat-total-products {
      .card-content {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
        
        i { color: rgba(255, 255, 255, 0.9); }
        .stat-label { color: rgba(255, 255, 255, 0.8); }
      }
    }

    .stat-sold-products {
      .card-content {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        color: white;
        
        i { color: rgba(255, 255, 255, 0.9); }
        .stat-label { color: rgba(255, 255, 255, 0.8); }
      }
    }

    .stat-available-products {
      .card-content {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #333;
        
        i { color: rgba(0, 0, 0, 0.7); }
        .stat-label { color: rgba(0, 0, 0, 0.6); }
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
          .p-inputtext {
            width: 250px;
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

          .p-button {
            background: #1976d2;
            border: none;
            color: white;
            
            &:hover {
              background: #1565c0;
            }
            
            &:focus {
              box-shadow: none;
            }
          }
        }

        .p-datepicker {
          padding: 0.5rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

          .p-datepicker-header {
            padding: 0.5rem;
            border-bottom: 1px solid #eee;
            margin-bottom: 0.5rem;

            .p-datepicker-title {
              .p-datepicker-month,
              .p-datepicker-year {
                padding: 0.25rem 0.5rem;
                font-weight: 600;
                margin: 0 0.25rem;
                border-radius: 4px;
                transition: background-color 0.2s;

                &:hover {
                  background-color: #f0f0f0;
                  cursor: pointer;
                }

                &:focus {
                  outline: none;
                  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
                }
              }
            }

            .p-datepicker-prev,
            .p-datepicker-next {
              width: 2rem;
              height: 2rem;
              border-radius: 50%;
              transition: background-color 0.2s;

              &:hover {
                background-color: #f0f0f0;
              }

              &:focus {
                outline: none;
                box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
              }
            }
          }

          table {
            font-size: 14px;
            border-collapse: collapse;
            width: 100%;

            th {
              padding: 0.5rem;
              text-align: center;
              font-weight: 600;
              color: #666;
            }

            td {
              padding: 0.25rem;

              > span {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;

                &:hover {
                  background-color: #f0f0f0;
                }

                &.p-highlight {
                  background-color: #1976d2;
                  color: white;
                }

                &.p-disabled {
                  opacity: 0.5;
                  pointer-events: none;
                }
              }
            }
          }

          .p-datepicker-buttonbar {
            padding: 0.5rem;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: space-between;

            button {
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              font-weight: 500;
              transition: all 0.2s;

              &.p-button-text {
                color: #666;

                &:hover {
                  background-color: #f0f0f0;
                }
              }

              &.p-button {
                background-color: #1976d2;
                color: white;

                &:hover {
                  background-color: #1565c0;
                }
              }
            }
          }
        }

        .p-datepicker-touch-ui {
          min-width: 300px;
          max-width: 90vw;
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 1100 !important;
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
        gap: 1rem;
      }

      .best-selling-section {
        ::ng-deep {
          .statistics-grid {
            grid-template-columns: 1fr;
          }
        }
      }
    }

    .calendar-container {
      position: relative;
      z-index: 1000;
    }

    .chart-container {
      position: relative;
      z-index: 1;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('dailyRevenueChart') dailyRevenueChartRef!: ElementRef;
  @ViewChild('monthlyRevenueChart') monthlyRevenueChartRef!: ElementRef;
  @ViewChild('yearlyRevenueChart') yearlyRevenueChartRef!: ElementRef;

  // Dashboard statistics
  totalRevenue: number = 0;
  dailyRevenue: number = 0;
  ordersToday: number = 0;
  totalProducts: number = 0;
  soldProducts: number = 0;
  availableProducts: number = 0;

  // Chart date ranges with default values
  dateRange: Date[] = [new Date(), new Date()];
  monthRange: Date[] = [new Date(), new Date()];
  yearRange: Date[] = [new Date(), new Date()];

  // Calendar configuration
  calendarConfig = {
    firstDayOfWeek: 1,
    dayNames: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    dayNamesMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
    monthNames: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    monthNamesShort: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
    today: 'Hôm nay',
    clear: 'Xóa',
    dateFormat: 'dd/mm/yy',
    weekHeader: 'Tuần'
  };

  // Chart instances
  private dailyChart: Chart | null = null;
  private monthlyChart: Chart | null = null;
  private yearlyChart: Chart | null = null;

  constructor(
    private statisticsService: StatisticsService,
    private orderService: OrderService,
    private primeNGConfig: PrimeNGConfig
  ) {}

  ngOnInit() {
    // Set PrimeNG calendar locale
    this.primeNGConfig.setTranslation(this.calendarConfig);
    
    // Initialize date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.dateRange = [thirtyDaysAgo, today];
    this.monthRange = [new Date(today.getFullYear(), 0, 1), today];
    this.yearRange = [new Date(today.getFullYear() - 5, 0, 1), today];

    // Load initial data
    this.loadDashboardData();
    this.onDateRangeSelect();
    this.onMonthRangeSelect();
    this.onYearRangeSelect();
  }

  private loadDashboardData() {
    // Load dashboard stats
    this.orderService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalRevenue = stats.totalRevenue;
        this.ordersToday = stats.todayOrders;
        this.soldProducts = stats.totalProductsSold;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.totalRevenue = 0;
        this.ordersToday = 0;
        this.soldProducts = 0;
      }
    });

    // Load daily revenue for today
    const today = new Date();
    this.statisticsService.getDailyRevenue().subscribe({
      next: (revenue) => {
        this.dailyRevenue = revenue;
      },
      error: (error) => {
        console.error('Error loading daily revenue:', error);
        this.dailyRevenue = 0;
      }
    });

    // Load product statistics
    this.statisticsService.getProductStatistics().subscribe({
      next: (stats) => {
        this.totalProducts = stats.totalProducts;
        this.availableProducts = stats.availableProducts;
      },
      error: (error) => {
        console.error('Error loading product statistics:', error);
        this.totalProducts = 0;
        this.availableProducts = 0;
      }
    });
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
    if (typeof window === 'undefined') return; // Skip on server-side

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
    if (typeof window === 'undefined') return; // Skip on server-side

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
    if (typeof window === 'undefined') return; // Skip on server-side

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