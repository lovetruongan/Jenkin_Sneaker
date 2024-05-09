import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { loginDetailDto } from '../dtos/login.dto';
import { loginReq } from '../types/loginReq';
import { registerReq } from '../types/registerReq';
import { registerDto } from '../dtos/register.dto';
import { UserDto } from '../dtos/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly token!: string | null;
  private readonly apiUrl : string = environment.apiUrl;
  constructor(
    private readonly httpClient: HttpClient,
  ) {
    if (typeof localStorage !== 'undefined'){
      this.token = localStorage.getItem("token");
    }
  }

  login(loginObject : loginReq){
    return this.httpClient.post<loginDetailDto>(`${this.apiUrl}users/login`,loginObject);
  }

  register(registerValue : registerReq){
    return this.httpClient.post<registerDto>(`${this.apiUrl}users/register`,registerValue);
  }

  getInforUser(token : string | null){
    return this.httpClient.get<UserDto>(`${this.apiUrl}users/details`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }
  getAllUser(){
    return this.httpClient.get<UserDto[]>(`${this.apiUrl}users/getAll`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }
  deleteUser(id: number){
    return this.httpClient.delete<{users: UserDto[],message: string}>(`${this.apiUrl}users/delete/${id}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }

  changeRoleUser(roleId: number, userId: number){
    return this.httpClient.put<{users: UserDto[],message: string}>(`${this.apiUrl}users/changeRole/${userId}`, roleId , {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      })
    });
  }
}
