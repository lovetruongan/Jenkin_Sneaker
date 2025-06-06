import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { ProductDto } from '../dtos/product.dto';
import { OrderService } from './order.service';
import { Observable, map, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HistoryOrderDto } from '../dtos/HistoryOrder.dto';

interface PriceRanges {
  min: number;
  max: number;
  avg: number;
  total: number;
  count: number;
  standardDeviation: number;
}

interface ScoreFactors {
  discount: number;
  price: number;
  purchaseHistory: number;
  category: number;
  random: number;
}

interface CategoryStats {
  count: number;
  totalSpent: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly isBrowser: boolean;
  private readonly MAX_RECOMMENDATIONS = 8;

  constructor(
    private orderService: OrderService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    console.log('=== Khởi tạo RecommendationService ===');
    console.log('- Môi trường browser:', this.isBrowser);
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      console.log('- Token:', token ? 'Đã đăng nhập' : 'Chưa đăng nhập');
      const userInfo = localStorage.getItem('userInfor');
      console.log('- Thông tin user:', userInfo ? JSON.parse(userInfo).name : 'Không có');
    }
  }

  getRecommendations(products: ProductDto[]): Observable<ProductDto[]> {
    console.log('\n=== Bắt đầu tính toán gợi ý ===');
    console.log('- Số lượng sản phẩm:', products.length);
    
    if (!this.isBrowser) {
      console.log('- Không phải môi trường browser, trả về gợi ý mặc định');
      return of(this.getDefaultRecommendations(products));
    }

    const token = localStorage.getItem('token');
    console.log('- Kiểm tra token:', token ? 'Có' : 'Không');
    
    if (!token) {
      console.log('- Chưa đăng nhập, trả về gợi ý mặc định');
      return of(this.getDefaultRecommendations(products));
    }

    console.log('- Đã đăng nhập, lấy lịch sử mua hàng...');
    return this.orderService.getHistoryOrder().pipe(
      map(orderHistory => {
        if (!orderHistory || orderHistory.length === 0) {
          console.log('- Không có lịch sử mua hàng, trả về gợi ý mặc định');
          return this.getDefaultRecommendations(products);
        }

        console.log('\n=== Phân tích lịch sử mua hàng ===');
        console.log('- Số đơn hàng:', orderHistory.length);
        
        const priceRanges = this.analyzePriceRanges(orderHistory);
        console.log('- Phân tích giá:');
        console.log('  + Thấp nhất:', priceRanges.min.toLocaleString('vi-VN'), 'VND');
        console.log('  + Cao nhất:', priceRanges.max.toLocaleString('vi-VN'), 'VND');
        console.log('  + Trung bình:', priceRanges.avg.toLocaleString('vi-VN'), 'VND');
        console.log('  + Độ lệch chuẩn:', priceRanges.standardDeviation.toLocaleString('vi-VN'), 'VND');
        console.log('  + Tổng chi tiêu:', priceRanges.total.toLocaleString('vi-VN'), 'VND');
        console.log('  + Số lần mua:', priceRanges.count);

        const categoryStats = this.analyzeCategoryStats(products, orderHistory);
        console.log('\n- Phân tích danh mục:');
        Object.entries(categoryStats).forEach(([categoryId, stats]) => {
          console.log(`  + Danh mục ${categoryId}:`);
          console.log(`    - Số lần mua: ${stats.count}`);
          console.log(`    - Tổng chi tiêu: ${stats.totalSpent.toLocaleString('vi-VN')} VND`);
        });

        return this.getPersonalizedRecommendations(products, priceRanges, orderHistory, categoryStats);
      })
    );
  }

  private analyzePriceRanges(orderHistory: HistoryOrderDto[]): PriceRanges {
    const ranges: PriceRanges = {
      min: Infinity,
      max: -Infinity,
      avg: 0,
      total: 0,
      count: 0,
      standardDeviation: 0
    };

    // Tính giá trị min, max, total và count
    orderHistory.forEach(order => {
      ranges.min = Math.min(ranges.min, order.total_money);
      ranges.max = Math.max(ranges.max, order.total_money);
      ranges.total += order.total_money;
      ranges.count++;
    });

    // Tính giá trị trung bình
    ranges.avg = ranges.total / ranges.count;

    // Tính độ lệch chuẩn
    const squaredDiffs = orderHistory.map(order => 
      Math.pow(order.total_money - ranges.avg, 2)
    );
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / ranges.count;
    ranges.standardDeviation = Math.sqrt(avgSquaredDiff);

    return ranges;
  }

  private analyzeCategoryStats(products: ProductDto[], orderHistory: HistoryOrderDto[]): Record<number, CategoryStats> {
    const categoryStats: Record<number, CategoryStats> = {};

    // Tạo map để tra cứu nhanh category_id từ tên sản phẩm
    const productNameToCategoryMap = new Map<string, number>();
    products.forEach(product => {
      if (product.category_id !== null) {
        productNameToCategoryMap.set(product.name, product.category_id);
      }
    });

    orderHistory.forEach(order => {
      const categoryId = productNameToCategoryMap.get(order.product_name);
      if (categoryId !== undefined) {
        if (!categoryStats[categoryId]) {
          categoryStats[categoryId] = { count: 0, totalSpent: 0 };
        }
        categoryStats[categoryId].count++;
        categoryStats[categoryId].totalSpent += order.total_money;
      }
    });

    return categoryStats;
  }

  private getPersonalizedRecommendations(
    products: ProductDto[],
    priceRanges: PriceRanges,
    orderHistory: HistoryOrderDto[],
    categoryStats: Record<number, CategoryStats>
  ): ProductDto[] {
    console.log('\n=== Tính điểm cho từng sản phẩm ===');
    console.log('Trọng số các yếu tố:');
    console.log('- Giảm giá: 35%');
    console.log('- Giá phù hợp: 35%');
    console.log('- Danh mục: 15%');
    console.log('- Lịch sử mua: 10%');
    console.log('- Ngẫu nhiên: 5%');

    const scoredProducts = products.map(product => {
      const score = this.calculateScore(product, priceRanges, orderHistory, categoryStats);
      return { product, score };
    });

    console.log('\n=== Top 8 sản phẩm được gợi ý ===');
    const recommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, this.MAX_RECOMMENDATIONS);

    recommendations.forEach(({ product, score }, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Giá: ${product.price.toLocaleString('vi-VN')} VND`);
      console.log(`   - Giảm giá: ${product.discount}%`);
      console.log(`   - Danh mục: ${product.category_id || 'Không có'}`);
      console.log(`   - Điểm: ${score.toFixed(4)}`);
    });

    return recommendations.map(item => item.product);
  }

  private calculateScore(
    product: ProductDto,
    priceRanges: PriceRanges,
    orderHistory: HistoryOrderDto[],
    categoryStats: Record<number, CategoryStats>
  ): number {
    const factors = this.calculateFactors(product, priceRanges, orderHistory, categoryStats);
    const total = Object.values(factors).reduce((sum, score) => sum + score, 0);

    console.log(`\nSản phẩm: ${product.name}`);
    console.log(`- Giá: ${product.price.toLocaleString('vi-VN')} VND`);
    console.log(`- Giảm giá: ${product.discount}%`);
    console.log(`- Danh mục: ${product.category_id || 'Không có'}`);
    console.log('Điểm thành phần:');
    console.log('- Điểm giảm giá:', factors.discount.toFixed(4), '(35%)');
    console.log('- Điểm giá:', factors.price.toFixed(4), '(35%)');
    console.log('- Điểm danh mục:', factors.category.toFixed(4), '(15%)');
    console.log('- Điểm lịch sử:', factors.purchaseHistory.toFixed(4), '(10%)');
    console.log('- Điểm ngẫu nhiên:', factors.random.toFixed(4), '(5%)');
    console.log('- Tổng điểm:', total.toFixed(4));

    return total;
  }

  private calculateFactors(
    product: ProductDto,
    priceRanges: PriceRanges,
    orderHistory: HistoryOrderDto[],
    categoryStats: Record<number, CategoryStats>
  ): ScoreFactors {
    const factors: ScoreFactors = {
      discount: 0,
      price: 0,
      purchaseHistory: 0,
      category: 0,
      random: 0
    };

    // Factor 1: Discount score (35%)
    if (product.discount > 0) {
      const discountDecimal = product.discount / 100;
      factors.discount = discountDecimal * 0.35;
    }

    // Factor 2: Price score (35%)
    // Sử dụng phân phối chuẩn để tính điểm giá
    const zScore = Math.abs(product.price - priceRanges.avg) / priceRanges.standardDeviation;
    // Chuyển z-score thành điểm từ 0-0.35 (35%)
    // Sử dụng hàm Gaussian để cho điểm cao nhất khi gần giá trung bình
    // và giảm dần khi xa giá trung bình
    factors.price = 0.35 * Math.exp(-Math.pow(zScore, 2) / 2);

    // Factor 3: Category score (15%)
    if (product.category_id !== null && categoryStats[product.category_id]) {
      const totalPurchases = Object.values(categoryStats).reduce((sum, stats) => sum + stats.count, 0);
      const categoryShare = categoryStats[product.category_id].count / totalPurchases;
      factors.category = Math.min(categoryShare * 0.15, 0.15);
    }

    // Factor 4: Purchase history penalty (10%)
    const recentPurchases = orderHistory
      .filter(order => order.product_name === product.name)
      .length;
    factors.purchaseHistory = Math.max(0, 0.1 - (recentPurchases * 0.025));

    // Factor 5: Random score (5%)
    factors.random = Math.random() * 0.05;

    return factors;
  }

  private getDefaultRecommendations(products: ProductDto[]): ProductDto[] {
    console.log('\n=== Lấy gợi ý mặc định ===');
    console.log('- Sắp xếp theo % giảm giá và yếu tố ngẫu nhiên');
    
    const recommendations = products
      .map(product => ({
        product,
        score: ((product.discount || 0) * 0.01 * 0.95) + (Math.random() * 0.05) // 95% discount + 5% random
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.MAX_RECOMMENDATIONS);

    console.log('\nTop 8 sản phẩm giảm giá cao nhất:');
    recommendations.forEach(({ product, score }, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Giá: ${product.price.toLocaleString('vi-VN')} VND`);
      console.log(`   - Giảm giá: ${product.discount}%`);
      console.log(`   - Danh mục: ${product.category_id || 'Không có'}`);
      console.log(`   - Điểm: ${score.toFixed(4)}`);
    });

    return recommendations.map(item => item.product);
  }
} 