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
import { UploadProductComponent } from './features/components/upload-product/upload-product.component';
import { RoleGuard } from './features/auth/authInterceptor/role.guard';
import { CategoryManageComponent } from './features/components/category-manage/category-manage.component';
import { UserManageComponent } from './features/components/user-manage/user-manage.component';
import { OrderManageComponent } from './features/components/order-manage/order-manage.component';
import { ADMIN_ROUTES } from './features/admin/admin.routes';
// import { VoucherManageComponent } from './features/components/voucher-manage/voucher-manage.component';
import { VoucherManageComponent } from './features/components/voucher-manage/voucher-manage.component';

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
      },
      {
        path: 'uploadProduct',
        component: UploadProductComponent,
        canActivate: [RoleGuard]
      },
      {
        path: 'categoryManage',
        component: CategoryManageComponent,
        canActivate: [RoleGuard]
      },
      {
        path: 'userManage',
        component: UserManageComponent,
        canActivate: [RoleGuard]
      },
      {
        path: 'orderManage',
        component: OrderManageComponent,
        canActivate: [RoleGuard]
      },
      {
        path: 'admin',
        children: ADMIN_ROUTES,
        canActivate: [RoleGuard]
      },
      {
        path: 'voucherManage',
        component: VoucherManageComponent,
        canActivate: [RoleGuard]
      }
    ]
  }
];
