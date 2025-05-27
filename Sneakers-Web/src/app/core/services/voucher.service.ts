import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { VoucherDto } from '../dtos/voucher.dto';
import { VoucherListDto } from '../dtos/voucherList.dto';
import { ApplyVoucherDto, VoucherApplicationResponseDto } from '../dtos/voucherApplication.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private apiUrl: string = environment.apiUrl;
  private token!: string | null;

  constructor(private httpClient: HttpClient) {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders(): HttpHeaders {
    // Get fresh token on each call
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`
    });
  }

  // Get all vouchers with pagination
  getAllVouchers(page: number = 0, limit: number = 10, filter: string = 'active'): Observable<VoucherListDto | any> {
    return this.httpClient.get<VoucherListDto | any>(
      `${this.apiUrl}vouchers?page=${page}&limit=${limit}&filter=${filter}`,
      { headers: this.getHeaders() }
    );
  }

  // Get voucher by ID
  getVoucherById(id: number): Observable<VoucherDto> {
    return this.httpClient.get<VoucherDto>(
      `${this.apiUrl}vouchers/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Get voucher by code
  getVoucherByCode(code: string): Observable<VoucherDto> {
    return this.httpClient.get<VoucherDto>(
      `${this.apiUrl}vouchers/code/${code}`,
      { headers: this.getHeaders() }
    );
  }

  // Search vouchers
  searchVouchers(keyword: string, page: number = 0, limit: number = 10): Observable<VoucherListDto | any> {
    return this.httpClient.get<VoucherListDto | any>(
      `${this.apiUrl}vouchers/search?keyword=${keyword}&page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Create new voucher (Admin only)
  createVoucher(voucher: VoucherDto): Observable<VoucherDto> {
    return this.httpClient.post<VoucherDto>(
      `${this.apiUrl}vouchers`,
      voucher,
      { headers: this.getHeaders() }
    );
  }

  // Update voucher (Admin only)
  updateVoucher(id: number, voucher: VoucherDto): Observable<VoucherDto> {
    return this.httpClient.put<VoucherDto>(
      `${this.apiUrl}vouchers/${id}`,
      voucher,
      { headers: this.getHeaders() }
    );
  }

  // Delete voucher (Admin only)
  deleteVoucher(id: number): Observable<any> {
    return this.httpClient.delete(
      `${this.apiUrl}vouchers/${id}`,
      { headers: this.getHeaders() }
    );
  }

  // Apply voucher to check discount
  applyVoucher(applyDto: ApplyVoucherDto): Observable<VoucherApplicationResponseDto> {
    return this.httpClient.post<VoucherApplicationResponseDto>(
      `${this.apiUrl}vouchers/apply`,
      applyDto,
      { headers: this.getHeaders() }
    );
  }
} 