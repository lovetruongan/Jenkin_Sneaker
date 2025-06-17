import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppNavbarComponent } from '../app-navbar/app-navbar.component';
// import { HomeComponent } from '../../../features/components/home/home.component';
import { MatInputModule } from '@angular/material/input';
import { AppFooterComponent } from '../app-footer/app-footer.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import { BaseComponent } from '../../commonComponent/base.component';
import { LoadingService } from '../../services/loading.service';
import { takeUntil, tap, filter } from 'rxjs';
import { AiChatbotComponent } from '../ai-chatbot/ai-chatbot.component';
import { ScrollToTopComponent } from '../../../shared/components/scroll-to-top/scroll-to-top.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    CommonModule,
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
export class AppLayoutComponent extends BaseComponent implements AfterViewInit, OnInit {
  public blockedUi: boolean = false;
  private lastScrollTop = 0;
  public isHeaderHidden = false;

  constructor(
    private loadingService: LoadingService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  ngAfterViewInit(): void {
    this.loadingService.loading$.pipe(
      tap((loading) => {
        this.blockedUi = loading;
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    // Hide header only when scrolling down and past the header's height
    if (st > this.lastScrollTop && st > 150) {
      this.isHeaderHidden = true;
    } else {
      this.isHeaderHidden = false;
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  }
}
