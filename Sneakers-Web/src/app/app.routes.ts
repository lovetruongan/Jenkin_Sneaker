import { Routes } from '@angular/router';
import { AppLayoutComponent } from './core/components/app-layout/app-layout.component';
import { HomeComponent } from './features/components/home/home.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { IntroductionComponent } from './features/components/introduction/introduction.component';
import { NewsComponent } from './features/components/news/news.component';
import { ShoppingCartComponent } from './features/components/shopping-cart/shopping-cart.component';
import { DetailProductComponent } from './features/components/detail-product/detail-product.component';
import { AuthGuard } from './features/auth/authInterceptor/auth.guard';
import { ContactComponent } from './features/components/contact/contact.component';
import { loginGuard } from './features/auth/authInterceptor/login.guard';
import { AllProductComponent } from './features/components/all-product/all-product.component';
import { OrderComponent } from './features/components/order/order.component';
import { OrderDetailComponent } from './features/components/order-detail/order-detail.component';
import { HistoryOrderComponent } from './features/components/history-order/history-order.component';
import { OrderGuard } from './features/auth/authInterceptor/order.guard';

export const routes: Routes = [
  {
    path: 'auth-login',
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [loginGuard]
  },
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/Home'
      },
      {
        path: 'Home',
        component: HomeComponent
      },
      {
        path: 'Intro',
        component: IntroductionComponent
      },
      {
        path: 'news',
        component: NewsComponent
      },
      {
        path: 'shoppingCart',
        component: ShoppingCartComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'detailProduct/:id',
        component: DetailProductComponent
      },
      {
        path: 'allProduct',
        component: AllProductComponent
      },
      {
        path: 'contact',
        component: ContactComponent
      },
      {
        path: 'order',
        component: OrderComponent,
        canActivate: [OrderGuard]
      },
      {
        path: 'order-detail/:id',
        component: OrderDetailComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'history',
        component: HistoryOrderComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];
