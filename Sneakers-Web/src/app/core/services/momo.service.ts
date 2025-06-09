import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderDto } from '../dtos/Order.dto';
import { MomoPaymentResponse } from '../dtos/momo-payment.dto';

@Injectable({
  providedIn: 'root'
})
export class MomoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/momo`;

  constructor() { }

  createPayment(orderData: OrderDto): Observable<MomoPaymentResponse> {
    return this.http.post<MomoPaymentResponse>(`${this.apiUrl}/create-payment`, orderData);
  }
}