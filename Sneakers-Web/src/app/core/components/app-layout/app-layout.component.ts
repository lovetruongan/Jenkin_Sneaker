import { AfterViewInit, Component } from '@angular/core';
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
import { AiChatbotComponent } from '../ai-chatbot/ai-chatbot.component';
import { ScrollToTopComponent } from '../../../shared/components/scroll-to-top/scroll-to-top.component';

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
    BlockUIModule,
    AiChatbotComponent,
    ScrollToTopComponent
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent extends BaseComponent implements AfterViewInit {
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
