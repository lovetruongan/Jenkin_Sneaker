import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { ProductDto } from '../dtos/product.dto';
import { UserService } from './user.service';
import { ProductService } from './product.service';
import { Observable, map, of, switchMap, tap } from 'rxjs';
import { LoggingService, RecommendationLog } from './logging.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private similarityMatrix: Map<number, Map<number, number>> = new Map();
  private readonly ALGORITHM_VERSION = '1.0.0';
  private readonly isBrowser: boolean;

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private loggingService: LoggingService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Get recommended products for the current user
  getRecommendedProducts(count: number = 8): Observable<ProductDto[]> {
    return this.productService.getAllProduct().pipe(
      map(response => {
        const allProducts = response.products || [];
        
        // If we don't have enough products, return what we have
        if (allProducts.length <= count) {
          this.logRecommendation([], allProducts, []);
          return allProducts;
        }

        // Get recommendations with scores
        const scoredProducts = this.getContentBasedRecommendations(allProducts, count);
        
        // Log the recommendation
        this.logRecommendation(
          scoredProducts.map(sp => sp.product.id),
          allProducts,
          scoredProducts
        );

        // Return only the products
        return scoredProducts.map(sp => sp.product);
      })
    );
  }

  private getContentBasedRecommendations(products: ProductDto[], count: number): Array<{
    product: ProductDto;
    score: number;
    factors: {
      discount: number;
      price: number;
      category: number;
      random: number;
    };
  }> {
    // Sort products by a combination of factors
    const scoredProducts = products.map(product => {
      const scores = this.calculateProductScores(product);
      return {
        product,
        score: scores.total,
        factors: scores.factors
      };
    });

    // Sort by score in descending order
    scoredProducts.sort((a, b) => b.score - a.score);

    // Return the top N products with their scores
    return scoredProducts.slice(0, count);
  }

  private calculateProductScores(product: ProductDto): { 
    total: number; 
    factors: { 
      discount: number; 
      price: number; 
      category: number; 
      random: number; 
    } 
  } {
    const factors = {
      discount: 0,
      price: 0,
      category: 0,
      random: 0
    };

    // Factor 1: Discount - products with discounts get a boost
    if (product.discount > 0) {
      factors.discount = product.discount * 0.5; // Weight discount by 0.5
    }

    // Factor 2: Price range normalization (assuming price range 0-10M VND)
    const normalizedPrice = 1 - (product.price / 10000000);
    factors.price = normalizedPrice * 0.3; // Weight price by 0.3

    // Factor 3: Category relevance (to be enhanced with user preferences)
    factors.category = 0.2; // Base category weight

    // Factor 4: Random factor to add some variety (0-0.2)
    factors.random = Math.random() * 0.2;

    // Calculate total score
    const total = Object.values(factors).reduce((sum, value) => sum + value, 0);

    return { total, factors };
  }

  private logRecommendation(
    recommendedProductIds: number[], 
    allProducts: ProductDto[],
    scoredProducts: Array<{
      product: ProductDto;
      score: number;
      factors: {
        discount: number;
        price: number;
        category: number;
        random: number;
      };
    }>
  ): void {
    // Create base log object
    const log: RecommendationLog = {
      timestamp: new Date(),
      recommendedProducts: recommendedProductIds,
      algorithmVersion: this.ALGORITHM_VERSION,
      factors: {
        discount: 0.5,
        price: 0.3,
        category: 0.2,
        random: 0.2
      },
      productScores: scoredProducts.map(sp => ({
        productId: sp.product.id,
        productName: sp.product.name,
        totalScore: sp.score,
        factors: sp.factors
      }))
    };

    // If we have a token and are in browser environment, get user info and add to log
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      if (token) {
        this.userService.getInforUser(token).subscribe({
          next: (user) => {
            log.userId = user.id || undefined;
            this.loggingService.logRecommendation(log);
          },
          error: () => {
            // If there's an error getting user info, still log without user ID
            this.loggingService.logRecommendation(log);
          }
        });
      } else {
        // If no token, log without user ID
        this.loggingService.logRecommendation(log);
      }
    } else {
      // If not in browser environment, just log without user ID
      this.loggingService.logRecommendation(log);
    }
  }

  // This method would be enhanced with real user behavior data
  private updateSimilarityMatrix(products: ProductDto[]): void {
    products.forEach(product1 => {
      if (!this.similarityMatrix.has(product1.id)) {
        this.similarityMatrix.set(product1.id, new Map());
      }
      
      products.forEach(product2 => {
        if (product1.id !== product2.id) {
          const similarity = this.calculateProductSimilarity(product1, product2);
          this.similarityMatrix.get(product1.id)?.set(product2.id, similarity);
        }
      });
    });
  }

  private calculateProductSimilarity(product1: ProductDto, product2: ProductDto): number {
    let similarity = 0;

    // Category similarity
    if (product1.category_id === product2.category_id) {
      similarity += 0.3;
    }

    // Price range similarity (within 20% of each other)
    const priceRatio = Math.min(product1.price, product2.price) / Math.max(product1.price, product2.price);
    if (priceRatio > 0.8) {
      similarity += 0.3 * priceRatio;
    }

    // Discount similarity
    const discountDiff = Math.abs(product1.discount - product2.discount);
    similarity += 0.2 * (1 - discountDiff / 100);

    return similarity;
  }
} 