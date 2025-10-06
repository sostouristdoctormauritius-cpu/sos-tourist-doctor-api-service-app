/**
 * Metrics Service
 * Collects and exposes application metrics for monitoring
 */

class MetricsService {
  constructor() {
    this.metrics = {
      // API request metrics
      apiRequests: {
        total: 0,
        byStatus: {},
        byMethod: {},
        averageResponseTime: 0,
        totalResponseTime: 0
      },
      
      // Database metrics
      database: {
        queries: 0,
        errors: 0,
        averageQueryTime: 0
      },
      
      // User metrics
      users: {
        total: 0,
        activeSessions: 0,
        byRole: {}
      },
      
      // Error metrics
      errors: {
        total: 0,
        byType: {}
      }
    };
    
    this.requestStartTimes = new Map();
  }
  
  // Track API request start
  startRequestTracking(reqId, method) {
    this.requestStartTimes.set(reqId, Date.now());
    
    // Increment method counter
    if (!this.metrics.apiRequests.byMethod[method]) {
      this.metrics.apiRequests.byMethod[method] = 0;
    }
    this.metrics.apiRequests.byMethod[method]++;
  }
  
  // Track API request completion
  endRequestTracking(reqId, statusCode, responseTime) {
    // Remove request from tracking
    this.requestStartTimes.delete(reqId);
    
    // Update metrics
    this.metrics.apiRequests.total++;
    
    // Update status code counter
    if (!this.metrics.apiRequests.byStatus[statusCode]) {
      this.metrics.apiRequests.byStatus[statusCode] = 0;
    }
    this.metrics.apiRequests.byStatus[statusCode]++;
    
    // Update response time metrics
    this.metrics.apiRequests.totalResponseTime += responseTime;
    this.metrics.apiRequests.averageResponseTime = 
      this.metrics.apiRequests.totalResponseTime / this.metrics.apiRequests.total;
  }
  
  // Track database query
  trackDatabaseQuery(duration, error = false) {
    this.metrics.database.queries++;
    
    if (error) {
      this.metrics.database.errors++;
    }
    
    // Update average query time
    // This is a simplified moving average
    this.metrics.database.averageQueryTime = 
      (this.metrics.database.averageQueryTime * (this.metrics.database.queries - 1) + duration) 
      / this.metrics.database.queries;
  }
  
  // Track user activity
  trackUserActivity(role) {
    this.metrics.users.total++;
    
    if (!this.metrics.users.byRole[role]) {
      this.metrics.users.byRole[role] = 0;
    }
    this.metrics.users.byRole[role]++;
  }
  
  // Track error
  trackError(errorType) {
    this.metrics.errors.total++;
    
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;
  }
  
  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
  
  // Reset metrics (useful for testing)
  resetMetrics() {
    this.metrics = {
      apiRequests: {
        total: 0,
        byStatus: {},
        byMethod: {},
        averageResponseTime: 0,
        totalResponseTime: 0
      },
      database: {
        queries: 0,
        errors: 0,
        averageQueryTime: 0
      },
      users: {
        total: 0,
        activeSessions: 0,
        byRole: {}
      },
      errors: {
        total: 0,
        byType: {}
      }
    };
    this.requestStartTimes = new Map();
  }
}

// Export singleton instance
module.exports = new MetricsService();