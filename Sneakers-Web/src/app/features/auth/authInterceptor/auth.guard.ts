import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthGuardService } from '../../../core/services/auth-guard.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authGuardService: AuthGuardService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('token') !== null) {
      // Kiểm tra trạng thái tài khoản
      const isAccountActive = await this.authGuardService.checkAccountStatus();
      return isAccountActive;
    } else {
      this.router.navigate(['/auth-login']);
      return false;
    }
  }
}