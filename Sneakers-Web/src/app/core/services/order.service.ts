import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OrderDto } from '../dtos/Order.dto';
import { InfoOrderDto } from '../dtos/InfoOrder.dto';
import { HistoryOrderDto } from '../dtos/HistoryOrder.dto';
import { isPlatformBrowser } from '@angular/common';
import { OrderListResponse } from '../responses/order.list.response';
import { Observable } from 'rxjs';

export interface DashboardStatsDTO {
  totalRevenue: number;
  todayOrders: number;
  totalProductsSold: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = environment.apiUrl;
  private readonly isBrowser: boolean;
  
  constructor(
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  postOrder(orderInfo: OrderDto) {
    return this.httpClient.post(`${this.apiUrl}/orders`, orderInfo, {
      headers: this.getHeaders()
    });
  }

  getOrderInfor(id: number) {
    return this.httpClient.get<InfoOrderDto>(`${this.apiUrl}/orders/user/${id}`, {
      headers: this.getHeaders()
    });
  }

  getHistoryOrder() {
    return this.httpClient.get<HistoryOrderDto[]>(`${this.apiUrl}/orders/user`, {
      headers: this.getHeaders()
    });
  }

  getAllOrders() {
    return this.httpClient.get<HistoryOrderDto[]>(`${this.apiUrl}/orders/admin`, {
      headers: this.getHeaders()
    });
  }

  getOrdersByKeyword(
    keyword: string, 
    status: string | null,
    startDate: string | null,
    endDate: string | null,
    page: number, 
    limit: number,
    sortBy: string,
    sortDir: string
  ): Observable<OrderListResponse> {
    // Ensure all parameters have valid values
    const safeKeyword = keyword || '';
    const safePage = page != null ? page : 0;
    const safeLimit = limit != null ? limit : 15;
    const safeSortBy = sortBy || 'orderDate';
    const safeSortDir = sortDir || 'desc';

    let params = new HttpParams()
      .set('keyword', safeKeyword)
      .set('page', safePage.toString())
      .set('limit', safeLimit.toString())
      .set('sortBy', safeSortBy)
      .set('sortDir', safeSortDir);

    if (status) {
      params = params.set('status', status);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.httpClient.get<OrderListResponse>(`${this.apiUrl}/orders/get-orders-by-keyword`, {
      headers: this.getHeaders(),
      params: params
    });
  }

  changeOrderState(state: string, orderId: number) {
    const statusDto = {
      status: state
    };
    return this.httpClient.put<{message: string}>(
      `${this.apiUrl}/orders/update/${orderId}`, 
      statusDto,
      {
      headers: this.getHeaders()
      }
    );
  }

  getTotalRevenue() {
    return this.httpClient.get<number>(`${this.apiUrl}/orders/revenue`, {
      headers: this.getHeaders()
    });
  }

  getDashboardStats() {
    return this.httpClient.get<DashboardStatsDTO>(`${this.apiUrl}/orders/dashboard-stats`, {
      headers: this.getHeaders()
    });
  }
}
