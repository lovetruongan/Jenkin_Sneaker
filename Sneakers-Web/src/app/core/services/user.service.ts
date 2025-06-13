import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { loginDetailDto } from '../dtos/login.dto';
import { loginReq } from '../types/loginReq';
import { registerReq } from '../types/registerReq';
import { registerDto } from '../dtos/register.dto';
import { UserDto } from '../dtos/user.dto';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { AccountMonitorService } from './account-monitor.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private readonly isBrowser: boolean;
  private apiRegister = `${environment.apiUrl}/users/register`;
  private apiLogin = `${environment.apiUrl}/users/login`;
  private apiUserDetails = `${environment.apiUrl}/users/details`;
  private apiForgotPassword = `${environment.apiUrl}/users/forgot-password`;
  private apiResetPassword = `${environment.apiUrl}/users/reset-password`;

  constructor(
    private readonly httpClient: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
    private accountMonitor: AccountMonitorService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHeaders(token?: string | null): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    // If token is provided as parameter, use it
    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
    }

    // Otherwise try to get from localStorage
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${storedToken}`
    });
  }

  login(loginData: loginReq): Observable<loginDetailDto> {
    return this.httpClient.post<loginDetailDto>(`${this.apiUrl}/login`, loginData);
  }

  register(registerData: registerReq): Observable<registerDto> {
    return this.httpClient.post<registerDto>(`${this.apiUrl}/register`, registerData);
  }

  getInforUser(token?: string | null) {
    return this.httpClient.get<UserDto>(`${this.apiUrl}/details`, {
      headers: this.getHeaders(token)
    }).pipe(
      tap((userInfo: UserDto) => {
        // Kiểm tra trạng thái tài khoản khi lấy thông tin user
        this.accountMonitor.checkAndHandleAccountStatus(userInfo);
      })
    );
  }

  getAllUser() {
    return this.httpClient.get<UserDto[]>(`${this.apiUrl}/getAll`, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number) {
    return this.httpClient.delete<{ users: UserDto[], message: string }>(`${this.apiUrl}/delete/${id}`, {
      headers: this.getHeaders()
    });
  }

  changeRoleUser(roleId: number, userId: number) {
    return this.httpClient.put<{ users: UserDto[], message: string }>(
      `${this.apiUrl}/changeRole/${userId}`, 
      { roleId },
      {
        headers: this.getHeaders()
      }
    );
  }

  changeActive(userId: number, activeUser: boolean) {
    const params = new HttpParams().set('activeUser', activeUser.toString());

    return this.httpClient.put<UserDto>(
      `${this.apiUrl}/change-active/${userId}`,
      {}, // không có body
      {
        params,
        headers: this.getHeaders()
      }
    );
  }

  /**
   * Cập nhật thông tin người dùng
   * @param userData - Dữ liệu người dùng cần cập nhật
   * @returns Observable containing updated user data
   */
  updateUser(userData: any): Observable<UserDto> {
    const url = `${this.apiUrl}/details/${userData.id}`;
    
    // Chuẩn bị dữ liệu theo format UpdateUserDTO
    const requestBody = {
      fullname: userData.fullname,
      phone_number: userData.phone_number,
      address: userData.address,
      date_of_birth: userData.date_of_birth,
      email: userData.email,
      // Không gửi password nếu không thay đổi
      // password: userData.password,
      // retype_password: userData.retype_password,
      facebook_account_id: userData.facebook_account_id || 0,
      google_account_id: userData.google_account_id || 0
    };

    return this.httpClient.put<UserDto>(url, requestBody, { 
      headers: this.getHeaders()
    });
  }

  getUserDetail(token: string): Observable<UserDto> {
    return this.httpClient.post<UserDto>(`${this.apiUrl}/details`, {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }

  updateUserDetail(userId: number, token: string, userData: any): Observable<UserDto> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.httpClient.put<UserDto>(`${this.apiUrl}/details/${userId}`, userData, { headers });
  }

  forgotPassword(email: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/change-password`, { 
      currentPassword, 
      newPassword 
    }, {
      headers: this.getHeaders()
    });
  }
}
