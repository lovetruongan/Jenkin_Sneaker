import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { OrderDto } from '../dtos/Order.dto';
import { InfoOrderDto } from '../dtos/InfoOrder.dto';
import { HistoryOrderDto } from '../dtos/HistoryOrder.dto';
import { isPlatformBrowser } from '@angular/common';

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
