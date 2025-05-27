import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { OrderDto } from '../dtos/Order.dto';
import { InfoOrderDto } from '../dtos/InfoOrder.dto';
import { HistoryOrderDto } from '../dtos/HistoryOrder.dto';

export interface DashboardStatsDTO {
  totalRevenue: number;
  todayOrders: number;
  totalProductsSold: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl: string = environment.apiUrl;
  private token: string | null = null;
  
  constructor(
    private httpClient: HttpClient
  ) {
    this.updateToken();
  }

  private updateToken() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders(): HttpHeaders {
    this.updateToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  postOrder(orderInfo: OrderDto) {
    return this.httpClient.post(`${this.apiUrl}orders`, orderInfo, {
      headers: this.getHeaders()
    });
  }

  getOrderInfor(id: number) {
    return this.httpClient.get<InfoOrderDto>(`${this.apiUrl}orders/user/${id}`, {
      headers: this.getHeaders()
    });
  }

  getHistoryOrder() {
    return this.httpClient.get<HistoryOrderDto[]>(`${this.apiUrl}orders/user`, {
      headers: this.getHeaders()
    });
  }

  getAllOrders() {
    return this.httpClient.get<HistoryOrderDto[]>(`${this.apiUrl}orders/admin`, {
      headers: this.getHeaders()
    });
  }

  changeOrderState(state: string, orderId: number) {
    return this.httpClient.put<{message: string}>(`${this.apiUrl}orders/update/${orderId}`, JSON.stringify(state), {
      headers: this.getHeaders()
    });
  }

  getTotalRevenue() {
    return this.httpClient.get<number>(`${this.apiUrl}orders/revenue`, {
      headers: this.getHeaders()
    });
  }

  getDashboardStats() {
    return this.httpClient.get<DashboardStatsDTO>(`${this.apiUrl}orders/dashboard-stats`, {
      headers: this.getHeaders()
    });
  }
}
