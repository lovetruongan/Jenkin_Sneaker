import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

// Interfaces matching backend DTOs
export interface ReturnRequest {
  order_id: number;
  reason: string;
}

export interface AdminReturnAction {
  admin_notes: string;
}

export interface ReturnRequestResponse {
  id: number;
  order_id: number;
  user_id: number;
  customer_name: string;
  reason: string;
  status: string;
  refund_amount: number;
  admin_notes: string;
  requested_at: string; // ISO date string
  updated_at: string; // ISO date string
  order_status: string; // Status of the actual order
  payment_method: string; // Payment method used
}

@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  private readonly apiUrl = `${environment.apiUrl}/returns`;
  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createReturnRequest(requestData: ReturnRequest): Observable<ReturnRequestResponse> {
    return this.http.post<ReturnRequestResponse>(this.apiUrl, requestData, { headers: this.getHeaders() });
  }

  getMyReturnRequests(): Observable<ReturnRequestResponse[]> {
    return this.http.get<ReturnRequestResponse[]>(`${this.apiUrl}/my-requests`, { headers: this.getHeaders() });
  }

  getAllReturnRequestsForAdmin(): Observable<ReturnRequestResponse[]> {
    return this.http.get<ReturnRequestResponse[]>(`${this.apiUrl}/admin/all`, { headers: this.getHeaders() });
  }

  approveReturnRequest(id: number, actionData: AdminReturnAction): Observable<ReturnRequestResponse> {
    return this.http.put<ReturnRequestResponse>(`${this.apiUrl}/admin/${id}/approve`, actionData, { headers: this.getHeaders() });
  }

  rejectReturnRequest(id: number, actionData: AdminReturnAction): Observable<ReturnRequestResponse> {
    return this.http.put<ReturnRequestResponse>(`${this.apiUrl}/admin/${id}/reject`, actionData, { headers: this.getHeaders() });
  }

  completeRefund(id: number, actionData: AdminReturnAction): Observable<ReturnRequestResponse> {
    return this.http.put<ReturnRequestResponse>(`${this.apiUrl}/admin/${id}/complete-refund`, actionData, { headers: this.getHeaders() });
  }
}