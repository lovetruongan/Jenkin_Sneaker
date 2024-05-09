import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppNavbarComponent } from '../app-navbar/app-navbar.component';
// import { HomeComponent } from '../../../features/components/home/home.component';
import { MatInputModule } from '@angular/material/input';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { BaseComponent } from '../../commonComponent/base.component';
import { LoadingService } from '../../services/loading.service';
import { takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AppHeaderComponent,
    MatInputModule,
    AppNavbarComponent,
    AppFooterComponent,
    ProgressSpinnerModule,
    BlockUIModule
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent extends BaseComponent implements AfterViewInit{
  public blockedUi: boolean = false;

  constructor(
    private loadingService: LoadingService
  ) {
    super();
  }
  ngAfterViewInit(): void {
    this.loadingService.loading$.pipe(
      tap((loading) => {
        this.blockedUi = loading;
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }
  
}
