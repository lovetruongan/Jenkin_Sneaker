import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppNavbarComponent } from '../app-navbar/app-navbar.component';
// import { HomeComponent } from '../../../features/components/home/home.component';
import { MatInputModule } from '@angular/material/input';
import { AppFooterComponent } from '../app-footer/app-footer.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AppHeaderComponent,
    MatInputModule,
    AppNavbarComponent,
    AppFooterComponent
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {

}
