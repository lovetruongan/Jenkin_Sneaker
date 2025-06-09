import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

declare const Stripe: any; // Use 'any' to avoid type conflicts with the imported Stripe type

export interface StripePaymentRequest {
  amount: number;
  currency: string;
  order_id: number;
  payment_method_id?: string;
  customer_email?: string;
  customer_name?: string;
}

export interface StripePaymentResponse {
  payment_intent_id: string;
  client_secret: string;
  status: string;
  amount: number;
  currency: string;
  order_id: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private http = inject(HttpClient);
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  // State management
  private paymentStatusSubject = new BehaviorSubject<string>('idle');
  public paymentStatus$ = this.paymentStatusSubject.asObservable();
  private stripeReady = new BehaviorSubject<boolean>(false);

  constructor() {
    // The Stripe script is now loaded from index.html
  }

  // Initialize Stripe after the script has loaded
  initializeStripe(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Stripe === 'undefined') {
        reject('Stripe.js has not loaded');
      } else {
        if (!this.stripe) {
          this.stripe = Stripe('pk_test_51RYEK0RoKh7pvaZeTzq1TjxJXE4Rfr5xwKIP6uL1kJDET3mb78shODbWhYyL1znUhqyanmoPV18g8zGCTkDUuok6003ObawJA1');
          if (this.stripe) {
            this.elements = this.stripe.elements();
            this.stripeReady.next(true);
            resolve();
          } else {
            reject('Failed to initialize Stripe elements');
          }
        } else {
          resolve(); // Already initialized
        }
      }
    });
  }

  createCardElement(): StripeCardElement | null {
    if (!this.elements) return null;

    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
      },
    });

    return this.cardElement;
  }

  createPaymentIntent(request: StripePaymentRequest): Observable<StripePaymentResponse> {
    return this.http.post<StripePaymentResponse>(
      `${environment.apiUrl}/stripe/create-payment-intent`,
      request
    );
  }

  async confirmPayment(clientSecret: string, customerDetails: any): Promise<any> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Stripe not initialized');
    }

    this.paymentStatusSubject.next('processing');

    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
        billing_details: {
          name: customerDetails.name,
          email: customerDetails.email,
        },
      },
    });

    if (result.error) {
      this.paymentStatusSubject.next('failed');
      throw new Error(result.error.message);
    } else {
      this.paymentStatusSubject.next('succeeded');
      return result.paymentIntent;
    }
  }

  confirmPaymentStatus(paymentIntentId: string): Observable<StripePaymentResponse> {
    return this.http.post<StripePaymentResponse>(
      `${environment.apiUrl}/stripe/confirm-payment/${paymentIntentId}`,
      {}
    );
  }

  getStripeConfig(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/stripe/config`);
  }

  resetPaymentStatus(): void {
    this.paymentStatusSubject.next('idle');
  }

  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }
} 