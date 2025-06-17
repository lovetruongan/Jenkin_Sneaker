import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { OrderDto } from '../dtos/Order.dto';
import { InfoOrderDto } from '../dtos/InfoOrder.dto';
import { HistoryOrderDto } from '../dtos/HistoryOrder.dto';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl: string = environment.apiUrl;
  private token !: string | null;
  
  constructor(
    private httpClient: HttpClient
  ) {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  postOrder(orderInfo: OrderDto){
    return this.httpClient.post(`${this.apiUrl}orders`, orderInfo, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  getOrderInfor(id: number){
    return this.httpClient.get<InfoOrderDto>(`${this.apiUrl}orders/user/${id}`,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  getHistoryOrder(){
    return this.httpClient.get<HistoryOrderDto[]>(`${this.apiUrl}orders/user`,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }
  getAllOrders(){
    return this.httpClient.get<HistoryOrderDto[]>(`${this.apiUrl}orders/admin`,{
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }
  changeOrderState(state: string, orderId: number){
    return this.httpClient.put<{message: string}>(`${this.apiUrl}orders/update/${orderId}`, JSON.stringify(state) , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }
}
