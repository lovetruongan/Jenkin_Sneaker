import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ScrollToTopComponent {
  windowScrolled = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
      this.windowScrolled = true;
    } else if (this.windowScrolled && (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10)) {
      this.windowScrolled = false;
    }
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }
} 