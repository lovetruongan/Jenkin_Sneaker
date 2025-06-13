import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { OrderDetailComponent } from '../components/order-detail/order-detail.component';
import { ReturnManageComponent } from '../components/return-manage/return-manage.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboardComponent
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent
  },
  {
    path: 'returns',
    component: ReturnManageComponent
  },
  // ... existing code ...
]; 