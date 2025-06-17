import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { filter, tap } from 'rxjs';
import { UserDto } from '../../../core/dtos/user.dto';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private token: string | null = null;
  private check: boolean = true;
  constructor(
    private router: Router,
    private userService: UserService
) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem("token");
    }
    this.userService.getInforUser(this.token).pipe(
        filter((userInfor: UserDto) => !!userInfor),
        tap((userInfor: UserDto) => {
            if (userInfor.role.id == 1){
                this.check = false;
            } else {
                this.check = true;
            }
        })
    ).subscribe();
    return this.check;
  }
}