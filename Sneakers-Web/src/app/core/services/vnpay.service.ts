import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { VnpayPaymentResponse } from '../responses/vnpay-payment.response';
import { CreateVnpayPaymentDto } from '../dtos/create-vnpay-payment.dto';

@Injectable({
  providedIn: 'root'
})
export class VnpayService {
  private apiVnpayUrl = `${environment.apiUrl}/vnpay`;

  constructor(private http: HttpClient) { }

  createVnpayPayment(paymentData: CreateVnpayPaymentDto): Observable<VnpayPaymentResponse> {
    return this.http.post<VnpayPaymentResponse>(`${this.apiVnpayUrl}/create-payment`, paymentData);
  }
} 