import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { ProductDto } from '../dtos/product.dto';
import { OrderService } from './order.service';
import { OrderHistoryService } from './order-history.service';
import { ProductService } from './product.service';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, firstValueFrom, of, catchError } from 'rxjs';
import { OrderDetailDto } from '../dtos/OrderDetail.dto';
import { HistoryOrderDto } from '../dtos/HistoryOrder.dto';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly isBrowser: boolean;
  private purchasedProducts: Set<number> = new Set();
  private categoryFrequency: Map<number, number> = new Map();

  constructor(
    private orderService: OrderService,
    private orderHistoryService: OrderHistoryService,
    private productService: ProductService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getRecommendations(products: ProductDto[]): Observable<ProductDto[]> {
    if (!this.isBrowser) {
      return of(this.getDefaultSuggestions(products));
    }

    console.log('Starting suggestProducts...');
    const token = localStorage.getItem('token');
    console.log('Token status:', token ? 'Found' : 'Not found');

    if (!token || token.trim() === '') {
      console.log('No valid token found, returning default suggestions');
      return of(this.getDefaultSuggestions(products));
    }

    return from(this.calculateRecommendations(products));
  }

  private async calculateRecommendations(products: ProductDto[]): Promise<ProductDto[]> {
    const inStockProducts = products.filter(p => p.quantity > 0);
    console.log('Starting product suggestion calculation...');
    
    // Check token again before making API calls
    const token = localStorage.getItem('token');
    if (!token || token.trim() === '') {
      console.log('Token missing during calculation, returning default suggestions');
      return this.getDefaultSuggestions(products);
    }
    
    await this.initializePurchasedProducts();

    try {
      console.log('Fetching order history for calculations...');
      const orderHistory = await firstValueFrom(
        this.orderService.getHistoryOrder().pipe(
          catchError(error => {
            console.error('Error fetching order history:', error);
            if (error.status === 400 || error.status === 401 || error.status === 403) {
              console.log('Authentication/authorization error, returning empty array');
              return of([]);
            }
            throw error;
          })
        )
      );
      
      console.log('Order history response:', orderHistory);
      
      if (!orderHistory || orderHistory.length === 0) {
        console.log('No order history found for calculations, returning default suggestions');
        return this.getDefaultSuggestions(products);
      }

      console.log(`Found ${orderHistory.length} orders for calculations`);

      // Get order details for each order to analyze category preferences
      const orderDetailsPromises = orderHistory.map(order => 
        firstValueFrom(this.orderService.getOrderInfor(order.id))
      );

      const allOrderDetails = await Promise.all(orderDetailsPromises);

      // Track purchased product quantities
      const purchaseQuantities = new Map<number, number>();
      let totalPurchasedQuantity = 0;

      // Collect all unique product IDs and their quantities from order details
      const productIds = new Set<number>();
      allOrderDetails.forEach(orderInfo => {
        if (orderInfo?.order_details) {
          orderInfo.order_details.forEach(detail => {
            if (detail?.product?.id) {
              productIds.add(detail.product.id);
              // Track quantity for this product
              const currentQuantity = purchaseQuantities.get(detail.product.id) || 0;
              purchaseQuantities.set(detail.product.id, currentQuantity + detail.number_of_products);
              totalPurchasedQuantity += detail.number_of_products;
            }
          });
        }
      });

      // Fetch complete product details for all products
      console.log(`Fetching complete details for ${productIds.size} unique products...`);
      const productDetailsPromises = Array.from(productIds).map(id => 
        firstValueFrom(this.productService.getProductById(id.toString()))
      );
      
      const productDetails = await Promise.all(productDetailsPromises);
      
      // Create a map of product details for quick lookup
      const productMap = new Map<number, ProductDto>();
      productDetails.forEach(product => {
        if (product && product.id) {
          productMap.set(product.id, product);
        }
      });

      // Reset category frequency
      this.categoryFrequency.clear();

      // Count category occurrences using complete product information
      let totalProcessedOrders = 0;
      let ordersWithValidDetails = 0;
      let totalProducts = 0;
      let productsWithValidCategory = 0;

      allOrderDetails.forEach(orderInfo => {
        if (orderInfo && orderInfo.order_details) {
          totalProcessedOrders++;
          let hasValidDetails = false;

          orderInfo.order_details.forEach(detail => {
            if (detail?.product?.id) {
              const completeProduct = productMap.get(detail.product.id);
              totalProducts++;
              hasValidDetails = true;

              if (completeProduct?.category_id !== undefined && completeProduct?.category_id !== null) {
                const categoryId = completeProduct.category_id;
                const currentCount = this.categoryFrequency.get(categoryId) || 0;
                this.categoryFrequency.set(categoryId, currentCount + detail.number_of_products);
                productsWithValidCategory++;
                this.purchasedProducts.add(detail.product.id);
              }
            }
          });

          if (hasValidDetails) {
            ordersWithValidDetails++;
          }
        }
      });

      // Log analysis results
      console.log('\nOrder Processing Analysis:');
      console.log(`Total orders processed: ${totalProcessedOrders}`);
      console.log(`Orders with valid details: ${ordersWithValidDetails}`);
      console.log(`Total products found: ${totalProducts}`);
      console.log(`Products with valid category: ${productsWithValidCategory}`);
      console.log(`Unique purchased products: ${this.purchasedProducts.size}`);

      // Calculate total frequency across all categories
      const totalCategoryFrequency = Array.from(this.categoryFrequency.values())
        .reduce((sum, count) => sum + count, 0);
      console.log('\nTotal category frequency:', totalCategoryFrequency);

      // Calculate price statistics
      const prices = inStockProducts.map(p => p.price);
      const priceStats = {
        average: prices.reduce((a, b) => a + b, 0) / prices.length,
        standardDeviation: Math.sqrt(
          prices.map(x => Math.pow(x - (prices.reduce((a, b) => a + b, 0) / prices.length), 2))
            .reduce((a, b) => a + b, 0) / prices.length
        ),
        min: Math.min(...prices),
        max: Math.max(...prices)
      };

      // Calculate scores for each product
      const scores = inStockProducts.map(product => {
        // Initialize score components
        const scoreComponents = {
          price: 0,
          category: 0,
          random: Math.random() * 0.05, // 5% random factor
          discount: product.discount ? (product.discount / 100) * 0.4 : 0, // Discount score proportional to discount percentage (max 40%)
          penalty: 0, // Penalty for previously purchased products
          total: 0
        };

        // Log discount calculation
        if (product.discount) {
          console.log(`Discount score calculation for ${product.name}:`, {
            discount_percentage: product.discount,
            discount_score: scoreComponents.discount.toFixed(3)
          });
        }

        // Price score (35% weight) - products closer to average price get higher scores
        const priceDeviation = Math.abs(product.price - priceStats.average);
        const normalizedPriceScore = Math.max(0, 1 - (priceDeviation / (2 * priceStats.standardDeviation)));
        scoreComponents.price = normalizedPriceScore * 0.35;

        // Category score (30% weight) - calculate based on category's share of total frequency
        if (product.category_id && this.categoryFrequency.has(product.category_id) && totalCategoryFrequency > 0) {
          const categoryCount = this.categoryFrequency.get(product.category_id) || 0;
          const categoryShare = categoryCount / totalCategoryFrequency;
          const weightedShare = Math.pow(categoryShare, 1.5);
          scoreComponents.category = weightedShare * 0.30;
        }

        // Apply quantity-based penalty for previously purchased products (20% penalty weighted by quantity ratio)
        if (this.purchasedProducts.has(product.id) && totalPurchasedQuantity > 0) {
          const productQuantity = purchaseQuantities.get(product.id) || 0;
          const quantityRatio = productQuantity / totalPurchasedQuantity;
          scoreComponents.penalty = -0.20 * quantityRatio; // 20% penalty weighted by quantity ratio
          console.log(`Applying quantity-based penalty to ${product.name}:`, {
            productQuantity,
            totalPurchasedQuantity,
            quantityRatio,
            penalty: scoreComponents.penalty.toFixed(3)
          });
        }

        // Calculate total score with penalty
        scoreComponents.total = scoreComponents.price + 
                              scoreComponents.category + 
                              scoreComponents.random + 
                              scoreComponents.discount +
                              scoreComponents.penalty;

        return {
          product,
          scores: scoreComponents
        };
      });

      // Log individual product scores for debugging
      console.log('\nFinal product scores:');
      scores.forEach(({ product, scores }) => {
        console.log(`${product.name}:`, {
          price: scores.price.toFixed(3),
          category: scores.category.toFixed(3),
          random: scores.random.toFixed(3),
          discount: scores.discount.toFixed(3),
          penalty: scores.penalty.toFixed(3),
          total: scores.total.toFixed(3)
        });
      });

      // Sort products by total score and return top 8
      const recommendedProducts = scores
        .sort((a, b) => b.scores.total - a.scores.total)
        .slice(0, 8)
        .map(item => item.product);

      // Log final recommendations summary
      console.log('\n=== FINAL RECOMMENDATIONS SUMMARY ===');
      console.log('Top 8 recommended products:');
      recommendedProducts.forEach((product, index) => {
        const productScore = scores.find(s => s.product.id === product.id);
        console.log(`\n${index + 1}. ${product.name}`);
        console.log('Details:', {
          id: product.id,
          category_id: product.category_id,
          price: product.price.toLocaleString('vi-VN') + ' VND',
          discount: product.discount ? `${product.discount}%` : 'No discount',
          was_purchased: this.purchasedProducts.has(product.id),
          category_frequency: product.category_id ? 
            (this.categoryFrequency.get(product.category_id) || 0) : 'N/A',
          scores: {
            price: productScore?.scores.price.toFixed(3),
            category: productScore?.scores.category.toFixed(3),
            random: productScore?.scores.random.toFixed(3),
            discount: productScore?.scores.discount.toFixed(3),
            penalty: productScore?.scores.penalty.toFixed(3),
            total: productScore?.scores.total.toFixed(3)
          }
        });
      });
      console.log('\n=== END OF RECOMMENDATIONS ===');

      return recommendedProducts;

    } catch (error) {
      console.error('Error in suggestProducts:', error);
      return this.getDefaultSuggestions(products);
    }
  }

  private async initializePurchasedProducts(): Promise<void> {
    this.purchasedProducts.clear();
    console.log('Initialized', this.purchasedProducts.size, 'purchased products');
  }

  private getDefaultSuggestions(products: ProductDto[]): ProductDto[] {
    // Filter out-of-stock products and return the first 8 as default suggestions
    return products.filter(p => p.quantity > 0).slice(0, 8);
  }
} 