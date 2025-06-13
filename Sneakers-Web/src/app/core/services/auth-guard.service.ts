import { Injectable } from '@angular/core';
import { UserDto } from '../dtos/user.dto';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AccountMonitorService } from './account-monitor.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    private http: HttpClient,
    private accountMonitor: AccountMonitorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  checkAccountStatus(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!isPlatformBrowser(this.platformId)) {
        resolve(true);
        return;
      }

      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfor');

      if (!token || !userInfo) {
        resolve(true);
        return;
      }

      // Kiểm tra thông tin user hiện tại bằng HTTP call trực tiếp
      this.getUserInfo(token).subscribe({
        next: (userInfor: UserDto) => {
          if (!this.accountMonitor.checkAndHandleAccountStatus(userInfor)) {
            resolve(false);
          } else {
            // Cập nhật thông tin user mới nhất
            localStorage.setItem("userInfor", JSON.stringify(userInfor));
            resolve(true);
          }
        },
        error: (error: any) => {
          console.error('Error checking account status:', error);
          // If token is invalid, clear storage and allow navigation to login
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfor');
            resolve(false); // This will trigger redirect to login
          } else {
            resolve(true); // Other errors, allow access
          }
        }
      });
    });
  }

  private getUserInfo(token: string): Observable<UserDto> {
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get<UserDto>(`${environment.apiUrl}/users/details`, { headers });
  }

  isAccountActive(): boolean {
    return this.accountMonitor.isCurrentAccountActive();
  }
} 