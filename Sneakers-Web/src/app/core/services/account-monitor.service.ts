import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountMonitorService {
  private showBlockedModalSubject = new BehaviorSubject<boolean>(false);
  public showBlockedModal$ = this.showBlockedModalSubject.asObservable();

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Kiểm tra và xử lý khi phát hiện tài khoản bị khóa
   * @param userInfo - Thông tin user từ API response
   * @returns true nếu tài khoản active, false nếu bị khóa
   */
  checkAndHandleAccountStatus(userInfo: any): boolean {
    if (!userInfo || userInfo.is_active !== false) {
      return true; // Tài khoản bình thường
    }

    // Tài khoản bị khóa - thực hiện đăng xuất
    this.handleBlockedAccount();
    return false;
  }

  /**
   * Xử lý khi tài khoản bị khóa
   */
  private handleBlockedAccount(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('Account blocked - logging out user');
    
    // Hiển thị modal thông báo
    this.showBlockedModal();
    
    // Xóa thông tin đăng nhập
    localStorage.removeItem("token");
    localStorage.removeItem("userInfor");
  }

  showBlockedModal(): void {
    this.showBlockedModalSubject.next(true);
  }

  hideBlockedModal(): void {
    this.showBlockedModalSubject.next(false);
    // Chuyển hướng về trang đăng nhập sau khi đóng modal
    this.router.navigate(['/auth-login']);
  }

  /**
   * Kiểm tra trạng thái tài khoản từ localStorage
   */
  isCurrentAccountActive(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const userInfo = localStorage.getItem('userInfor');
    if (!userInfo) {
      return true;
    }

    try {
      const user = JSON.parse(userInfo);
      return user.is_active !== false;
    } catch {
      return true;
    }
  }

  /**
   * Kiểm tra ID user hiện tại
   */
  getCurrentUserId(): number | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const userInfo = localStorage.getItem('userInfor');
    if (!userInfo) {
      return null;
    }

    try {
      const user = JSON.parse(userInfo);
      return user.id;
    } catch {
      return null;
    }
  }
} 