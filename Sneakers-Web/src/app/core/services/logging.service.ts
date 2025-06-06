import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface RecommendationLog {
  timestamp: Date;
  userId?: number;
  recommendedProducts: number[];
  algorithmVersion: string;
  factors: {
    discount: number;
    price: number;
    category: number;
    purchaseHistory: number;
    random: number;
  };
  productScores?: Array<{
    productId: number;
    productName: string;
    totalScore: number;
    factors: {
      discount: number;
      price: number;
      category: number;
      purchaseHistory: number;
      random: number;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly LOG_KEY = 'recommendation_logs';
  private readonly MAX_LOGS = 1000; // Maximum number of logs to keep
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.cleanOldLogs();
    }
  }

  logRecommendation(log: RecommendationLog): void {
    // Add timestamp if not present
    if (!log.timestamp) {
      log.timestamp = new Date();
    }

    // Save to localStorage if in browser environment
    if (this.isBrowser) {
      this.saveToLocalStorage(log);
    }

    // Log to console in development
    if (!environment.production) {
      console.group('Recommendation Log');
      console.log('Timestamp:', log.timestamp);
      console.log('User ID:', log.userId || 'Anonymous');
      console.log('Algorithm Version:', log.algorithmVersion);
      console.log('Recommended Products:', log.recommendedProducts);
      console.log('Weighting Factors:', log.factors);
      if (log.productScores) {
        console.log('Product Scoring Details:');
        console.table(log.productScores);
      }
      console.groupEnd();
    }

    // In production, you might want to send logs to a server
    if (environment.production) {
      this.sendToServer(log);
    }
  }

  private saveToLocalStorage(log: RecommendationLog): void {
    if (!this.isBrowser) return;

    try {
      // Get existing logs
      const existingLogs = this.getLogs();
      
      // Add new log
      existingLogs.push(log);
      
      // Keep only the latest MAX_LOGS
      if (existingLogs.length > this.MAX_LOGS) {
        existingLogs.splice(0, existingLogs.length - this.MAX_LOGS);
      }

      // Save back to localStorage
      localStorage.setItem(this.LOG_KEY, JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Error saving log to localStorage:', error);
    }
  }

  getLogs(): RecommendationLog[] {
    if (!this.isBrowser) return [];

    try {
      const logs = localStorage.getItem(this.LOG_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Error reading logs from localStorage:', error);
      return [];
    }
  }

  getLogsByDateRange(startDate: Date, endDate: Date): RecommendationLog[] {
    if (!this.isBrowser) return [];

    return this.getLogs().filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  getLogsByUserId(userId: number): RecommendationLog[] {
    if (!this.isBrowser) return [];

    return this.getLogs().filter(log => log.userId === userId);
  }

  clearLogs(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(this.LOG_KEY);
  }

  private cleanOldLogs(): void {
    if (!this.isBrowser) return;

    try {
      const logs = this.getLogs();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= thirtyDaysAgo;
      });

      localStorage.setItem(this.LOG_KEY, JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Error cleaning old logs:', error);
    }
  }

  private sendToServer(log: RecommendationLog): void {
    // TODO: Implement server logging when backend API is available
    // This would typically involve sending the log to a backend endpoint
    // that would store it in a database for analysis
    
    // Example implementation:
    // this.http.post('api/logs/recommendation', log).subscribe(
    //   () => console.log('Log sent to server'),
    //   error => console.error('Error sending log to server:', error)
    // );
  }

  // Export logs as CSV
  exportLogsAsCSV(): string {
    if (!this.isBrowser) return '';

    const logs = this.getLogs();
    if (logs.length === 0) return '';

    // Define CSV headers
    const headers = [
      'Timestamp',
      'User ID',
      'Algorithm Version',
      'Recommended Products',
      'Discount Factor',
      'Price Factor',
      'Category Factor',
      'Purchase History Factor',
      'Random Factor'
    ];

    // Convert logs to CSV format
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userId || 'Anonymous',
        log.algorithmVersion,
        `"[${log.recommendedProducts.join(', ')}]"`,
        log.factors.discount,
        log.factors.price,
        log.factors.category,
        log.factors.purchaseHistory,
        log.factors.random
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  // Download logs as CSV file
  downloadLogsAsCSV(): void {
    if (!this.isBrowser) return;

    const csv = this.exportLogsAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recommendation_logs_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
} 