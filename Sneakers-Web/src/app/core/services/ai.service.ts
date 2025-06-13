import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface ChatResponse {
  response: string;
  success: boolean;
  timestamp: number;
  type?: string;
}

export interface SearchResult {
  text: string;
  metadata: any;
  score?: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  topK: number;
  resultCount: number;
  results: SearchResult[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl: string = environment.apiUrl;
  private token: string | null = null;

  constructor(private httpClient: HttpClient) {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  // Text chat with AI
  chatWithText(message: string): Observable<ChatResponse> {
    return this.httpClient.post<ChatResponse>(`${this.apiUrl}/ai/chat/text`, { message });
  }

  // Chat with product assistant
  productAssistant(query: string): Observable<ChatResponse> {
    return this.httpClient.post<ChatResponse>(`${this.apiUrl}/ai/chat/product-assistant`, { query });
  }

  // Chat with image
  chatWithImage(image: File, prompt: string): Observable<ChatResponse> {
    const formData = new FormData();
    formData.append('image', image, image.name);
    formData.append('prompt', prompt);

    // Don't set Content-Type header - let Angular set it automatically with boundary
    return this.httpClient.post<ChatResponse>(`${this.apiUrl}/ai/chat/image`, formData);
  }

  // Search products using vector search
  searchProducts(query: string, topK: number = 10): Observable<SearchResponse> {
    return this.httpClient.get<SearchResponse>(`${this.apiUrl}/ai/search/products?query=${encodeURIComponent(query)}&topK=${topK}`);
  }

  // Search products by category
  searchProductsByCategory(query: string, category: string, topK: number = 10): Observable<SearchResponse> {
    return this.httpClient.get<SearchResponse>(
      `${this.apiUrl}/ai/search/products/category?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&topK=${topK}`
    );
  }

  // Search products by price range
  searchProductsByPriceRange(query: string, minPrice: number, maxPrice: number, topK: number = 10): Observable<SearchResponse> {
    return this.httpClient.get<SearchResponse>(
      `${this.apiUrl}/ai/search/products/price-range?query=${encodeURIComponent(query)}&minPrice=${minPrice}&maxPrice=${maxPrice}&topK=${topK}`
    );
  }

  // Search products with scores
  searchProductsWithScores(query: string, topK: number = 10, minScore: number = 0.7): Observable<SearchResponse> {
    return this.httpClient.get<SearchResponse>(
      `${this.apiUrl}/ai/search/products/with-scores?query=${encodeURIComponent(query)}&topK=${topK}&minScore=${minScore}`
    );
  }
} 