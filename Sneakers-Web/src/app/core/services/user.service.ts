import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { loginDetailDto } from '../dtos/login.dto';
import { loginReq } from '../types/loginReq';
import { registerReq } from '../types/registerReq';
import { registerDto } from '../dtos/register.dto';
import { UserDto } from '../dtos/user.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly token!: string | null;
  private readonly apiUrl: string = environment.apiUrl;
  constructor(
    private readonly httpClient: HttpClient,
  ) {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem("token");
    }
  }

  login(loginObject: loginReq) {
    return this.httpClient.post<loginDetailDto>(`${this.apiUrl}users/login`, loginObject);
  }

  register(registerValue: registerReq) {
    return this.httpClient.post<registerDto>(`${this.apiUrl}users/register`, registerValue);
  }

  getInforUser(token: string | null) {
    return this.httpClient.get<UserDto>(`${this.apiUrl}users/details`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }
  getAllUser() {
    return this.httpClient.get<UserDto[]>(`${this.apiUrl}users/getAll`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }
  deleteUser(id: number) {
    return this.httpClient.delete<{ users: UserDto[], message: string }>(`${this.apiUrl}users/delete/${id}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  changeRoleUser(roleId: number, userId: number) {
    return this.httpClient.put<{ users: UserDto[], message: string }>(`${this.apiUrl}users/changeRole/${userId}`, roleId, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }
  changeActive(userId: number, activeUser: boolean) {
    const params = new HttpParams().set('activeUser', activeUser.toString());

    return this.httpClient.put<UserDto>(
      `${this.apiUrl}users/change-active/${userId}`,
      {}, // không có body
      {
        params,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        })
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
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
    
    // Chuẩn bị dữ liệu theo format UpdateUserDTO
    const requestBody = {
      fullname: userData.fullname,
      phone_number: userData.phone_number,
      address: userData.address,
      date_of_birth: userData.date_of_birth,
      // Không gửi password nếu không thay đổi
      // password: userData.password,
      // retype_password: userData.retype_password,
      facebook_account_id: userData.facebook_account_id || 0,
      google_account_id: userData.google_account_id || 0
    };

    return this.httpClient.put<UserDto>(url, requestBody, { headers });
  }
  
}
