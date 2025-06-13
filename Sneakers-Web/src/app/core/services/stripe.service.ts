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
  private cardElementInstances: Map<string, StripeCardElement> = new Map();

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

    const cardElement = this.elements.create('card', {
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

    // Generate unique ID for this instance
    const instanceId = 'card_' + Math.random().toString(36).substr(2, 9);
    this.cardElementInstances.set(instanceId, cardElement);
    
    // Store the instance ID on the element for later reference
    (cardElement as any)._instanceId = instanceId;

    return cardElement;
  }

  createPaymentIntent(request: StripePaymentRequest): Observable<StripePaymentResponse> {
    return this.http.post<StripePaymentResponse>(
      `${environment.apiUrl}/stripe/create-payment-intent`,
      request
    );
  }

  async confirmPayment(clientSecret: string, customerDetails: any, cardElement: StripeCardElement): Promise<any> {
    if (!this.stripe || !cardElement) {
      throw new Error('Stripe not initialized');
    }

    this.paymentStatusSubject.next('processing');

    const result = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
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

  destroyCardElement(cardElement?: StripeCardElement): void {
    if (cardElement) {
      const instanceId = (cardElement as any)._instanceId;
      if (instanceId && this.cardElementInstances.has(instanceId)) {
        cardElement.destroy();
        this.cardElementInstances.delete(instanceId);
      }
    } else {
      // Destroy all instances if no specific element provided
      this.cardElementInstances.forEach(element => element.destroy());
      this.cardElementInstances.clear();
    }
  }
} 