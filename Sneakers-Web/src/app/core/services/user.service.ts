import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { loginDetailDto } from '../dtos/login.dto';
import { loginReq } from '../types/loginReq';
import { registerReq } from '../types/registerReq';
import { registerDto } from '../dtos/register.dto';
import { UserDto } from '../dtos/user.dto';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl: string = environment.apiUrl;
  private readonly isBrowser: boolean;

  constructor(
    private readonly httpClient: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem("token");
  }

  private getAuthHeaders(token?: string | null): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const authToken = token || this.getToken();
    if (authToken) {
      return headers.set('Authorization', `Bearer ${authToken}`);
    }

    return headers;
  }

  login(loginObject: loginReq) {
    return this.httpClient.post<loginDetailDto>(`${this.apiUrl}users/login`, loginObject);
  }

  register(registerValue: registerReq) {
    return this.httpClient.post<registerDto>(`${this.apiUrl}users/register`, registerValue);
  }

  getInforUser(token?: string | null) {
    return this.httpClient.get<UserDto>(`${this.apiUrl}users/details`, {
      headers: this.getAuthHeaders(token)
    });
  }

  getAllUser() {
    return this.httpClient.get<UserDto[]>(`${this.apiUrl}users/getAll`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(id: number) {
    return this.httpClient.delete<{ users: UserDto[], message: string }>(`${this.apiUrl}users/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  changeRoleUser(roleId: number, userId: number) {
    return this.httpClient.put<{ users: UserDto[], message: string }>(
      `${this.apiUrl}users/changeRole/${userId}`, 
      roleId,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  changeActive(userId: number, activeUser: boolean) {
    const params = new HttpParams().set('activeUser', activeUser.toString());

    return this.httpClient.put<UserDto>(
      `${this.apiUrl}users/change-active/${userId}`,
      {}, // không có body
      {
        params,
        headers: this.getAuthHeaders()
      }
    );
  }

  /**
   * Cập nhật thông tin người dùng
   * @param userData - Dữ liệu người dùng cần cập nhật
   * @returns Observable containing updated user data or users list
   */
  /**
   * Cập nhật thông tin người dùng
   * @param userData - Dữ liệu người dùng cần cập nhật
   * @returns Observable containing updated user data
   */
  updateUser(userData: any): Observable<UserDto> {
    const url = `${this.apiUrl}users/details/${userData.id}`;
    
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
      headers: this.getAuthHeaders()
    });
  }
}
