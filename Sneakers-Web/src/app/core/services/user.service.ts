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
  private readonly apiUrl : string = environment.apiUrl;
  constructor(
    private readonly httpClient: HttpClient,
  ) {}

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
}
