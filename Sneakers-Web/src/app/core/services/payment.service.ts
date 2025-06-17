import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

export interface PaymentDTO {
  order_id: number;
  payment_method: string;
  amount: number;
  return_url?: string;
  cancel_url?: string;
  description?: string;
}

export interface PaymentUrlResponse {
  payment_id: number;
  payment_url: string;
  qr_code?: string;
  payment_method: string;
  message: string;
  expires_at: string;
}

export interface PaymentStatusResponse {
  payment_id: number;
  order_id: number;
  payment_status: string;
  transaction_id: string;
  amount: number;
  payment_method: string;
  message: string;
  is_success: boolean;
}

export interface PaymentResponse {
  id: number;
  order_id: number;
  payment_method: string;
  payment_status: string;
  amount: number;
  transaction_id: string;
  gateway_transaction_id?: string;
  payment_date?: string;
  failure_reason?: string;
  gateway_fee?: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl: string = environment.apiUrl;
  private token!: string | null;

  constructor(private httpClient: HttpClient) {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders(): HttpHeaders {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`
    });
  }

  createPayment(paymentDTO: PaymentDTO): Observable<PaymentUrlResponse> {
    return this.httpClient.post<PaymentUrlResponse>(
      `${this.apiUrl}payments/create`,
      paymentDTO,
      { headers: this.getHeaders() }
    );
  }

  getPaymentById(paymentId: number): Observable<PaymentResponse> {
    return this.httpClient.get<PaymentResponse>(
      `${this.apiUrl}payments/${paymentId}`,
      { headers: this.getHeaders() }
    );
  }

  getPaymentByOrderId(orderId: number): Observable<PaymentResponse> {
    return this.httpClient.get<PaymentResponse>(
      `${this.apiUrl}payments/order/${orderId}`,
      { headers: this.getHeaders() }
    );
  }

  getPaymentsByUser(): Observable<PaymentResponse[]> {
    return this.httpClient.get<PaymentResponse[]>(
      `${this.apiUrl}payments/user`,
      { headers: this.getHeaders() }
    );
  }

  getPaymentStatus(paymentId: number): Observable<PaymentStatusResponse> {
    return this.httpClient.get<PaymentStatusResponse>(
      `${this.apiUrl}payments/status/${paymentId}`,
      { headers: this.getHeaders() }
    );
  }

  cancelPayment(paymentId: number, reason: string): Observable<PaymentResponse> {
    return this.httpClient.post<PaymentResponse>(
      `${this.apiUrl}payments/${paymentId}/cancel?reason=${encodeURIComponent(reason)}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Admin functions
  getAllPayments(page: number = 0, limit: number = 10): Observable<any> {
    return this.httpClient.get<any>(
      `${this.apiUrl}payments/admin/all?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  refundPayment(paymentId: number, amount: number, reason: string): Observable<PaymentResponse> {
    return this.httpClient.post<PaymentResponse>(
      `${this.apiUrl}payments/${paymentId}/refund?amount=${amount}&reason=${encodeURIComponent(reason)}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // Utility methods
  formatPaymentStatus(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ thanh toán';
      case 'COMPLETED':
        return 'Đã thanh toán';
      case 'FAILED':
        return 'Thanh toán thất bại';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  }

  formatPaymentMethod(method: string): string {
    switch (method) {
      case 'CASH':
        return 'Tiền mặt';
      case 'BANKING':
        return 'Chuyển khoản ngân hàng';
      case 'VNPAY':
        return 'VNPay';
      case 'MOMO':
        return 'MoMo';
      case 'STRIPE':
        return 'Thẻ tín dụng';
      default:
        return method;
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'CASH':
        return 'pi pi-money-bill';
      case 'BANKING':
        return 'pi pi-building';
      case 'VNPAY':
        return 'pi pi-credit-card';
      case 'MOMO':
        return 'pi pi-mobile';
      case 'STRIPE':
        return 'pi pi-credit-card';
      default:
        return 'pi pi-money-bill';
    }
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      case 'CANCELLED':
        return 'secondary';
      case 'REFUNDED':
        return 'info';
      default:
        return 'secondary';
    }
  }
}