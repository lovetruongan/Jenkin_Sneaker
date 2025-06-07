import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, throwError, catchError, retry } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface OrderHistoryItem {
  productId: number;
  categoryId: number;
  quantity: number;
  purchaseDate: Date;
  price: number;
  status: string;
  orderId: number;
}

interface OrderDetail {
  id: number;
  product: {
    id: number;
    category_id: number;
  };
  numberOfProducts: number;
  price: number;
}

interface OrderHistoryResponse {
  id: number;
  user_id: number;
  status: string;
  total_money: number;
  product_name: string;
  order_date: string;
  thumbnail: string;
  total_products: number;
  buyer_name: string;
  phone_number: string;
  orderDetails: OrderDetail[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {
  private readonly apiUrl = environment.apiUrl;
  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getUserOrderHistory(): Observable<OrderHistoryItem[]> {
    if (!this.isBrowser) {
      return of([]);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return of([]);
    }

    return this.http.get<OrderHistoryResponse[]>(`${this.apiUrl}/orders/user`, {
      headers: this.getHeaders()
    }).pipe(
      retry(3), // Retry failed requests 3 times
      catchError(this.handleError),
      map(orders => {
        if (!orders || !Array.isArray(orders)) {
          return [];
        }
        
        return orders.flatMap(order => {
          if (!order || !order.orderDetails || !Array.isArray(order.orderDetails)) {
            return [];
          }

          return order.orderDetails.filter(detail => 
            detail && 
            detail.product && 
            typeof detail.product.id !== 'undefined' && 
            typeof detail.product.category_id !== 'undefined'
          ).map(detail => ({
            productId: detail.product.id,
            categoryId: detail.product.category_id,
            quantity: detail.numberOfProducts,
            purchaseDate: new Date(order.order_date),
            price: detail.price,
            status: order.status,
            orderId: order.id
          }));
        });
      })
    );
  }

  getTodayOrders(): Observable<OrderHistoryItem[]> {
    if (!this.isBrowser) {
      return of([]);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return of([]);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.http.get<OrderHistoryResponse[]>(`${this.apiUrl}/orders/user`, {
      headers: this.getHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError),
      map(orders => {
        if (!orders || !Array.isArray(orders)) {
          return [];
        }
        
        return orders
          .filter(order => {
            const orderDate = new Date(order.order_date);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
          })
          .flatMap(order => {
            if (!order || !order.orderDetails || !Array.isArray(order.orderDetails)) {
              return [];
            }

            return order.orderDetails.filter(detail => 
              detail && 
              detail.product && 
              typeof detail.product.id !== 'undefined' && 
              typeof detail.product.category_id !== 'undefined'
            ).map(detail => ({
              productId: detail.product.id,
              categoryId: detail.product.category_id,
              quantity: detail.numberOfProducts,
              purchaseDate: new Date(order.order_date),
              price: detail.price,
              status: order.status,
              orderId: order.id
            }));
          });
      })
    );
  }

  // Calculate category preferences based on order history
  calculateCategoryPreferences(history: OrderHistoryItem[]): Map<number, number> {
    const preferences = new Map<number, number>();
    const totalPurchases = history.reduce((sum, item) => sum + item.quantity, 0);

    // Group by category and calculate preference scores
    history.forEach(item => {
      const currentScore = preferences.get(item.categoryId) || 0;
      const purchaseWeight = item.quantity / totalPurchases;
      
      // Add recency weight (more recent purchases have higher weight)
      const daysSincePurchase = (new Date().getTime() - item.purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
      const recencyWeight = Math.exp(-daysSincePurchase / 30); // Exponential decay over 30 days
      
      preferences.set(
        item.categoryId,
        currentScore + (purchaseWeight * recencyWeight)
      );
    });

    return preferences;
  }

  // Calculate price range preferences
  calculatePriceRangePreference(history: OrderHistoryItem[]): {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  } {
    if (history.length === 0) {
      return { minPrice: 0, maxPrice: Infinity, avgPrice: 0 };
    }

    const prices = history.map(item => item.price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return {
      minPrice: Math.min(...prices) * 0.8, // 20% below minimum
      maxPrice: Math.max(...prices) * 1.2, // 20% above maximum
      avgPrice
    };
  }
} 