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
  orderId: number;
  userId: number;
  customerName: string;
  reason: string;
  status: string;
  refundAmount: number;
  adminNotes: string;
  requestedAt: string; // ISO date string
  updatedAt: string; // ISO date string
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
}