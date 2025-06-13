import { Component, OnInit } from '@angular/core';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { BaseComponent } from '../../commonComponent/base.component';
import { MenuItem } from 'primeng/api';
import { CategoriesService } from '../../services/categories.service';
import { catchError, filter, map, of, takeUntil, tap } from 'rxjs';
import { CategoriesDto } from '../../dtos/categories.dto';
import { UserService } from '../../services/user.service';
import { UserDto } from '../../dtos/user.dto';

@Component({
  selector: 'app-app-navbar',
  standalone: true,
  imports: [
    OverlayPanelModule,
    ButtonModule,
    RouterLink,
    MenuModule
  ],
  templateUrl: './app-navbar.component.html',
  styleUrl: './app-navbar.component.scss'
})
export class AppNavbarComponent extends BaseComponent implements OnInit {
  public roleId: number = 100;
  public token: string | null = null;
  public isMenuOpen: boolean = false;
  public isLoggedIn: boolean = false;
  categories: MenuItem[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private userService: UserService,
    private readonly router: Router
  ) {
    super();
    if (typeof localStorage != 'undefined'){
      this.token = localStorage.getItem("token");
      this.isLoggedIn = !!this.token;
      this.roleId = parseInt(JSON.parse(localStorage.getItem("userInfor") || '{"role_id": "0"}').role_id || '0');
    }
  }

  ngOnInit(): void {
    if (this.token != null){
      this.userService.getInforUser(this.token).pipe(
        filter((userInfo: UserDto) => !!userInfo),
        tap((userInfo: UserDto) => {
          this.roleId = userInfo.role.id;
        }),
        takeUntil(this.destroyed$),
        catchError((err) => of(err))
      ).subscribe()
    }

    this.categoriesService.getCategories().pipe(
      filter((categoriesVal: CategoriesDto[]) => !!categoriesVal),
      tap((categoriesVal: CategoriesDto[]) => {
        categoriesVal.forEach((element: CategoriesDto) => {
          this.categories?.push({
            label: `${element.name}`,
            command: () => {
              this.navigateToCategory(element.name);
            }
          })
        });
      }),
      catchError(() => {
        return of();
      }),
      takeUntil(this.destroyed$)
    ).subscribe()
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToCategory(categoryName: string) {
    this.router.navigateByUrl(`/Category/${categoryName}`);
    this.isMenuOpen = false; // Đóng menu khi chuyển trang
  }
}
