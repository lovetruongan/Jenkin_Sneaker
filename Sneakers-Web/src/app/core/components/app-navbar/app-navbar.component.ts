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
  categories: MenuItem[] = [];
  constructor(
    private categoriesService: CategoriesService,
    private readonly router: Router
  ) {
    super();
  }

  ngOnInit(): void {
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

  navigateToCategory(categoryName: string) {
    this.router.navigateByUrl(`/Category/${categoryName}`)
  }
}
