import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { OrderDetailComponent } from '../components/order-detail/order-detail.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboardComponent
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent
  },
  // ... existing code ...
]; 