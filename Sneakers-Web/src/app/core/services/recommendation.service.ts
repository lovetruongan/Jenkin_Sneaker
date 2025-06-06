import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { ProductDto } from '../dtos/product.dto';
import { UserService } from './user.service';
import { ProductService } from './product.service';
import { Observable, map, of, switchMap, tap, forkJoin } from 'rxjs';
import { LoggingService, RecommendationLog } from './logging.service';
import { isPlatformBrowser } from '@angular/common';
import { OrderHistoryService, OrderHistoryItem } from './order-history.service';

interface ScoredProduct {
  product: ProductDto;
  score: number;
  factors: {
    discount: number;
    price: number;
    category: number;
    purchaseHistory: number;
    diversity: number;
    random: number;
  };
}

interface ProductPreferences {
  purchasedProducts: Set<number>;
  purchasedCategories: Set<number>;
  lastPurchaseDates: Map<number, Date>;
  categoryPurchaseCount: Map<number, number>;
  averageSpending: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private similarityMatrix: Map<number, Map<number, number>> = new Map();
  private readonly ALGORITHM_VERSION = '2.2.0';
  private readonly isBrowser: boolean;
  private readonly DIVERSITY_THRESHOLD = 0.7; // Threshold for product similarity
  private readonly PURCHASE_PENALTY = -0.5; // Strong penalty for previously purchased products
  private readonly CATEGORY_SATURATION = 3; // Max number of products from same category
  private readonly MAX_PRICE = 100000000; // Maximum price (100 million VND)
  private readonly PRICE_RANGE_FLEXIBILITY = 0.5; // Allow recommendations 50% above/below average spending

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private loggingService: LoggingService,
    private orderHistoryService: OrderHistoryService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Get recommended products for the current user
  getRecommendedProducts(count: number = 8): Observable<ProductDto[]> {
    if (!this.isBrowser) {
      return this.getDefaultRecommendations(count);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return this.getDefaultRecommendations(count);
    }

    return this.userService.getInforUser(token).pipe(
      switchMap(user => {
        const userId = user?.id;
        if (!userId) {
          return this.getDefaultRecommendations(count);
        }

        return forkJoin({
          products: this.productService.getAllProduct(),
          orderHistory: this.orderHistoryService.getUserOrderHistory()
        }).pipe(
          map(({ products, orderHistory }) => {
            const allProducts = products.products || [];
            
            if (allProducts.length <= count) {
              this.logRecommendation([], allProducts, [], userId);
              return allProducts;
            }

            // Get user preferences from order history
            const categoryPreferences = this.orderHistoryService.calculateCategoryPreferences(orderHistory);
            const pricePreferences = this.orderHistoryService.calculatePriceRangePreference(orderHistory);
            const productPreferences = this.calculateProductPreferences(orderHistory);

            // Update similarity matrix
            this.updateSimilarityMatrix(allProducts);

            // Get recommendations with scores
            const scoredProducts = this.getPersonalizedRecommendations(
              allProducts,
              count,
              categoryPreferences,
              pricePreferences,
              productPreferences
            );

            // Log the recommendation
            this.logRecommendation(
              scoredProducts.map(sp => sp.product.id),
              allProducts,
              scoredProducts,
              userId
            );

            // Return only the products
            return scoredProducts.map(sp => sp.product);
          })
        );
      })
    );
  }

  private calculateProductPreferences(orderHistory: OrderHistoryItem[]): ProductPreferences {
    const preferences: ProductPreferences = {
      purchasedProducts: new Set(),
      purchasedCategories: new Set(),
      lastPurchaseDates: new Map(),
      categoryPurchaseCount: new Map(),
      averageSpending: 0
    };

    let totalSpent = 0;
    let totalItems = 0;

    orderHistory.forEach(item => {
      // Track purchased products
      preferences.purchasedProducts.add(item.productId);

      // Track categories
      if (item.categoryId !== null) {
        preferences.purchasedCategories.add(item.categoryId);
        
        // Update category purchase count
        const currentCount = preferences.categoryPurchaseCount.get(item.categoryId) || 0;
        preferences.categoryPurchaseCount.set(item.categoryId, currentCount + item.quantity);
      }

      // Track last purchase dates
      const currentDate = preferences.lastPurchaseDates.get(item.productId);
      const itemDate = new Date(item.purchaseDate);
      if (!currentDate || itemDate > currentDate) {
        preferences.lastPurchaseDates.set(item.productId, itemDate);
      }

      // Calculate average spending
      totalSpent += item.price * item.quantity;
      totalItems += item.quantity;
    });

    preferences.averageSpending = totalItems > 0 ? totalSpent / totalItems : this.MAX_PRICE / 2;

    return preferences;
  }

  private getDefaultRecommendations(count: number): Observable<ProductDto[]> {
    return this.productService.getAllProduct().pipe(
      map(response => {
        const allProducts = response.products || [];
        
        if (allProducts.length <= count) {
          this.logRecommendation([], allProducts, []);
          return allProducts;
        }

        // Update similarity matrix
        this.updateSimilarityMatrix(allProducts);

        const scoredProducts = this.getPersonalizedRecommendations(
          allProducts,
          count,
          new Map(), // Empty category preferences
          { minPrice: 0, maxPrice: Infinity, avgPrice: 0 }, // Default price preferences
          {
            purchasedProducts: new Set(),
            purchasedCategories: new Set(),
            lastPurchaseDates: new Map(),
            categoryPurchaseCount: new Map(),
            averageSpending: this.MAX_PRICE / 2 // Default to half of max price
          }
        );
        
        this.logRecommendation(
          scoredProducts.map(sp => sp.product.id),
          allProducts,
          scoredProducts
        );

        return scoredProducts.map(sp => sp.product);
      })
    );
  }

  private getPersonalizedRecommendations(
    products: ProductDto[],
    count: number,
    categoryPreferences: Map<number, number>,
    pricePreferences: { minPrice: number; maxPrice: number; avgPrice: number },
    productPreferences: ProductPreferences
  ): ScoredProduct[] {
    // Keep track of selected categories for diversity
    const selectedCategories = new Map<number, number>();

    // Sort products by initial scores
    const scoredProducts = products.map(product => {
      const scores = this.calculatePersonalizedScores(
        product,
        categoryPreferences,
        pricePreferences,
        productPreferences,
        selectedCategories
      );
      return {
        product,
        score: scores.total,
        factors: scores.factors
      };
    });

    // Sort by score in descending order
    scoredProducts.sort((a, b) => b.score - a.score);

    // Filter and re-rank products for diversity
    const finalRecommendations: ScoredProduct[] = [];
    const consideredProducts = new Set<number>();

    while (finalRecommendations.length < count && scoredProducts.length > 0) {
      const candidate = scoredProducts.shift();
      if (!candidate) break;

      // Skip if too similar to already selected products
      const isTooSimilar = Array.from(consideredProducts).some(productId => {
        const similarity = this.similarityMatrix.get(candidate.product.id)?.get(productId) || 0;
        return similarity > this.DIVERSITY_THRESHOLD;
      });

      if (!isTooSimilar) {
        // Update category count
        if (candidate.product.category_id !== null) {
          const currentCount = selectedCategories.get(candidate.product.category_id) || 0;
          if (currentCount < this.CATEGORY_SATURATION) {
            selectedCategories.set(candidate.product.category_id, currentCount + 1);
            finalRecommendations.push(candidate);
            consideredProducts.add(candidate.product.id);
          }
        } else {
          finalRecommendations.push(candidate);
          consideredProducts.add(candidate.product.id);
        }
      }
    }

    return finalRecommendations;
  }

  private calculatePersonalizedScores(
    product: ProductDto,
    categoryPreferences: Map<number, number>,
    pricePreferences: { minPrice: number; maxPrice: number; avgPrice: number },
    productPreferences: ProductPreferences,
    selectedCategories: Map<number, number>
  ): {
    total: number;
    factors: {
      discount: number;
      price: number;
      category: number;
      purchaseHistory: number;
      diversity: number;
      random: number;
    };
  } {
    const factors = {
      discount: 0,
      price: 0,
      category: 0,
      purchaseHistory: 0,
      diversity: 0,
      random: 0
    };

    // Factor 1: Discount - products with discounts get a boost
    if (product.discount > 0) {
      factors.discount = product.discount * 0.3;
    }

    // Factor 2: Price range preference
    const avgSpending = productPreferences.averageSpending;
    const minPreferredPrice = Math.max(0, avgSpending * (1 - this.PRICE_RANGE_FLEXIBILITY));
    const maxPreferredPrice = Math.min(this.MAX_PRICE, avgSpending * (1 + this.PRICE_RANGE_FLEXIBILITY));

    if (product.price >= minPreferredPrice && product.price <= maxPreferredPrice) {
      // Calculate how close the price is to the average spending
      const priceDiff = Math.abs(product.price - avgSpending);
      const maxDiff = avgSpending * this.PRICE_RANGE_FLEXIBILITY;
      
      // Higher score for prices closer to average spending
      factors.price = 0.25 * (1 - priceDiff / maxDiff);
    } else {
      // Penalty for products far outside the preferred price range
      const distanceFromRange = Math.min(
        Math.abs(product.price - minPreferredPrice),
        Math.abs(product.price - maxPreferredPrice)
      );
      const penaltyFactor = Math.min(1, distanceFromRange / (avgSpending * this.PRICE_RANGE_FLEXIBILITY));
      factors.price = -0.25 * penaltyFactor;
    }

    // Factor 3: Category preference
    if (product.category_id !== null) {
      const categoryId = product.category_id;
      const categoryScore = categoryPreferences.get(categoryId) || 0;
      
      // Reduce score if we already have enough products from this category
      const currentCategoryCount = selectedCategories.get(categoryId) || 0;
      const categoryPenalty = currentCategoryCount >= this.CATEGORY_SATURATION ? -0.3 : 0;
      
      factors.category = (categoryScore * 0.3) + categoryPenalty;
    }

    // Factor 4: Purchase history - strong penalty for previously purchased items
    if (productPreferences.purchasedProducts.has(product.id)) {
      factors.purchaseHistory = this.PURCHASE_PENALTY;
      
      // Add time-based decay to the penalty
      const lastPurchaseDate = productPreferences.lastPurchaseDates.get(product.id);
      if (lastPurchaseDate) {
        const daysSinceLastPurchase = (new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24);
        // Gradually reduce penalty over 180 days
        const timeFactor = Math.min(daysSinceLastPurchase / 180, 1);
        factors.purchaseHistory *= (1 - timeFactor);
      }
    }

    // Factor 5: Diversity score
    if (product.category_id !== null) {
      const categoryCount = selectedCategories.get(product.category_id) || 0;
      factors.diversity = Math.max(0, 0.2 * (1 - categoryCount / this.CATEGORY_SATURATION));
    }

    // Factor 6: Random factor to add some variety (0-0.15)
    factors.random = Math.random() * 0.15;

    // Calculate total score
    const total = Object.values(factors).reduce((sum, value) => sum + value, 0);

    return { total, factors };
  }

  private logRecommendation(
    recommendedProductIds: number[],
    allProducts: ProductDto[],
    scoredProducts: ScoredProduct[],
    userId?: number
  ): void {
    // Create base log object
    const log: RecommendationLog = {
      timestamp: new Date(),
      userId,
      recommendedProducts: recommendedProductIds,
      algorithmVersion: this.ALGORITHM_VERSION,
      factors: {
        discount: 0.3,
        price: 0.25,
        category: 0.3,
        purchaseHistory: 0.1,
        random: 0.15
      },
      productScores: scoredProducts.map(sp => ({
        productId: sp.product.id,
        productName: sp.product.name,
        totalScore: sp.score,
        factors: sp.factors
      }))
    };

    this.loggingService.logRecommendation(log);
  }

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
    if (product1.category_id !== null && product2.category_id !== null && product1.category_id === product2.category_id) {
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