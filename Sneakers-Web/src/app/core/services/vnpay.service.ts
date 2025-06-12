import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VNPayCreatePaymentRequest {
  amount: number;
  bankCode?: string;
  language?: string;
  orderInfo: string;
  orderId: number;
}

export interface VNPayCreatePaymentResponse {
  code: string;
  message: string;
  data: string; // Payment URL
}

export interface VNPayQueryRequest {
  txnRef: string;
  transDate: string;
}

export interface VNPayRefundRequest {
  transactionType: string;
  txnRef: string;
  amount: number;
  transDate: string;
  user: string;
  transactionNo?: string;
}

export interface VNPayReturnParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo?: string;
  vnp_CardType?: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

export interface VNPayReturnResponse {
  isValid: string;
  vnp_ResponseCode: string;
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_PayDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class VNPayService {
  private readonly baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Create VNPay payment URL
   */
  createPayment(request: VNPayCreatePaymentRequest): Observable<VNPayCreatePaymentResponse> {
    return this.http.post<VNPayCreatePaymentResponse>(`${this.baseUrl}/create-payment`, request);
  }

  /**
   * Query transaction status
   */
  queryTransaction(request: VNPayQueryRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/query`, request);
  }

  /**
   * Refund transaction
   */
  refundTransaction(request: VNPayRefundRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/refund`, request);
  }

  /**
   * Handle VNPay return callback
   */
  handleReturn(params: VNPayReturnParams): Observable<VNPayReturnResponse> {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    return this.http.get<VNPayReturnResponse>(`${this.baseUrl}/vnpay-return?${queryString}`);
  }

  /**
   * Parse URL parameters from VNPay return
   */
  parseReturnParams(url: string): VNPayReturnParams {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const params: any = {};
    
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    
    return params as VNPayReturnParams;
  }

  /**
   * Redirect to VNPay payment URL
   */
  redirectToPayment(paymentUrl: string): void {
    window.location.href = paymentUrl;
  }

  /**
   * Check if payment was successful based on response code
   */
  isPaymentSuccessful(responseCode: string): boolean {
    return responseCode === '00';
  }

  /**
   * Get payment status message
   */
  getPaymentStatusMessage(responseCode: string): string {
    const statusMessages: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
      '99': 'Các lỗi khác'
    };
    
    return statusMessages[responseCode] || 'Lỗi không xác định';
  }
} 