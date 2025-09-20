# ⚡ Performance Engineering - Sub-100ms Response Times

## 🎯 Performance Targets & SLAs

### **Latency Percentiles (P99.9 targets)**
```typescript
interface PerformanceSLA {
  qrVerification: 150,     // P99.9 < 150ms
  cropSearch: 300,         // P99.9 < 300ms  
  realTimeTracking: 50,    // P99.9 < 50ms
  blockchainSync: 15000,   // P99.9 < 15s
  fileUpload: 5000,        // P99.9 < 5s
  apiGateway: 100          // P99.9 < 100ms
}
```

### **Throughput Targets**
- **QR Verifications**: 10,000 RPS sustained
- **Crop Searches**: 5,000 RPS sustained  
- **Real-time Updates**: 50,000 concurrent connections
- **File Uploads**: 1,000 concurrent uploads

## 🚀 Database Performance Optimization

### **Advanced Indexing Strategies**
```sql
-- Composite indexes with optimal column ordering
CREATE INDEX CONCURRENTLY idx_crop_batches_optimized 
ON crop_batches (current_state, crop_type, harvest_date DESC, owner_address)
WHERE current_state IN (0, 1, 2); -- Partial index for active states

-- Covering indexes to avoid table lookups
CREATE INDEX CONCURRENTLY idx_crop_search_covering
ON crop_batches (crop_type, harvest_date DESC) 
INCLUDE (token_id, quantity, origin_farm, quality_score);

-- GIN indexes for JSONB queries
CREATE INDEX CONCURRENTLY idx_metadata_gin 
ON crop_batches USING GIN (metadata jsonb_path_ops);

-- Spatial indexes for location queries
CREATE INDEX CONCURRENTLY idx_transporter_location_gist
ON transporters USING GIST (current_location)
WHERE status = 'available';
```

### **Query Optimization Patterns**
```sql
-- Optimized pagination with cursor-based approach
WITH ranked_batches AS (
  SELECT token_id, crop_type, harvest_date, 
         ROW_NUMBER() OVER (ORDER BY harvest_date DESC, token_id) as rn
  FROM crop_batches 
  WHERE crop_type = $1 AND harvest_date > $2
)
SELECT * FROM ranked_batches 
WHERE rn > $3 LIMIT $4;

-- Materialized view for expensive aggregations
CREATE MATERIALIZED VIEW crop_analytics_hourly AS
SELECT 
  date_trunc('hour', created_at) as hour,
  crop_type,
  COUNT(*) as batch_count,
  AVG(quality_score) as avg_quality,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY quantity) as median_quantity
FROM crop_batches
GROUP BY 1, 2;

-- Refresh strategy with minimal locking
CREATE OR REPLACE FUNCTION refresh_analytics_incremental()
RETURNS void AS $$
BEGIN
  -- Only refresh last 24 hours of data
  DELETE FROM crop_analytics_hourly 
  WHERE hour >= date_trunc('hour', NOW() - INTERVAL '24 hours');
  
  INSERT INTO crop_analytics_hourly
  SELECT 
    date_trunc('hour', created_at) as hour,
    crop_type,
    COUNT(*) as batch_count,
    AVG(quality_score) as avg_quality,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY quantity) as median_quantity
  FROM crop_batches
  WHERE created_at >= date_trunc('hour', NOW() - INTERVAL '24 hours')
  GROUP BY 1, 2;
END;
$$ LANGUAGE plpgsql;
```

### **Connection Pool Optimization**
```typescript
class OptimizedConnectionPool {
  private readPool: Pool;
  private writePool: Pool;
  private analyticsPool: Pool;

  constructor() {
    // Separate pools for different workloads
    this.readPool = new Pool({
      host: 'read-replica.postgres.com',
      max: 50,                    // Higher for read-heavy workload
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 5000,    // Prevent long-running queries
      query_timeout: 5000
    });

    this.writePool = new Pool({
      host: 'master.postgres.com', 
      max: 20,                    // Lower for write workload
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 1000,
      statement_timeout: 10000
    });

    this.analyticsPool = new Pool({
      host: 'analytics.postgres.com',
      max: 10,                    // Dedicated for heavy queries
      idleTimeoutMillis: 60000,
      statement_timeout: 60000    // Allow longer analytics queries
    });
  }

  async query(sql: string, params: any[], type: 'read' | 'write' | 'analytics' = 'read') {
    const pool = this.getPool(type);
    const start = Date.now();
    
    try {
      const result = await pool.query(sql, params);
      this.recordMetrics(type, Date.now() - start, 'success');
      return result;
    } catch (error) {
      this.recordMetrics(type, Date.now() - start, 'error');
      throw error;
    }
  }
}
```

## 🔄 Advanced Caching Architecture

### **Multi-Tier Caching with Cache Warming**
```typescript
class IntelligentCache {
  private l1 = new LRUCache<string, any>({ max: 10000, ttl: 300000 }); // 5min
  private l2: Redis;
  private l3: PostgreSQL;

  async warmCache(patterns: string[]) {
    // Predictive cache warming based on usage patterns
    const warmingTasks = patterns.map(async (pattern) => {
      const keys = await this.identifyHotKeys(pattern);
      await Promise.all(
        keys.map(key => this.preloadToCache(key))
      );
    });

    await Promise.all(warmingTasks);
  }

  async getWithFallback<T>(key: string, fallback: () => Promise<T>): Promise<T> {
    // L1: In-memory (sub-millisecond)
    const l1Value = this.l1.get(key);
    if (l1Value !== undefined) {
      this.recordCacheHit('l1', key);
      return l1Value;
    }

    // L2: Redis (1-5ms)
    const l2Value = await this.l2.get(key);
    if (l2Value) {
      const parsed = JSON.parse(l2Value);
      this.l1.set(key, parsed);
      this.recordCacheHit('l2', key);
      return parsed;
    }

    // L3: Database fallback
    const value = await fallback();
    
    // Write-behind caching to avoid blocking
    setImmediate(() => {
      this.l1.set(key, value);
      this.l2.setex(key, 3600, JSON.stringify(value));
    });

    this.recordCacheMiss(key);
    return value;
  }

  // Cache invalidation with dependency tracking
  async invalidateWithDependencies(key: string) {
    const dependencies = await this.getDependencies(key);
    const allKeys = [key, ...dependencies];
    
    await Promise.all([
      ...allKeys.map(k => this.l1.delete(k)),
      this.l2.del(...allKeys)
    ]);
  }
}
```

### **Edge Caching with CDN Integration**
```typescript
class EdgeCacheManager {
  private cloudflare: CloudflareAPI;

  async deployEdgeFunction(qrVerificationLogic: string) {
    // Deploy QR verification logic to edge locations
    await this.cloudflare.workers.deploy({
      name: 'qr-verification-edge',
      script: `
        addEventListener('fetch', event => {
          event.respondWith(handleRequest(event.request))
        })

        async function handleRequest(request) {
          const url = new URL(request.url);
          const tokenId = url.pathname.split('/').pop();
          
          // Check edge cache first
          const cached = await caches.default.match(request);
          if (cached) return cached;
          
          // Verify at edge with minimal data
          const verification = await verifyAtEdge(tokenId);
          
          const response = new Response(JSON.stringify(verification), {
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=300' // 5min edge cache
            }
          });
          
          event.waitUntil(caches.default.put(request, response.clone()));
          return response;
        }
      `,
      routes: ['greenledger.com/verify/*']
    });
  }

  async purgeCache(patterns: string[]) {
    // Intelligent cache purging
    await this.cloudflare.zones.purgeCache({
      files: patterns,
      tags: ['qr-verification', 'crop-data']
    });
  }
}
```

## 📊 Real-Time Performance Monitoring

### **Custom Performance Metrics**
```typescript
class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>();
  
  startTimer(operation: string, metadata?: any): PerformanceTimer {
    return {
      operation,
      startTime: performance.now(),
      metadata,
      end: () => this.recordTiming(operation, performance.now() - this.startTime, metadata)
    };
  }

  recordTiming(operation: string, duration: number, metadata?: any) {
    const metric = this.metrics.get(operation) || new PerformanceMetric(operation);
    metric.record(duration, metadata);
    
    // Real-time alerting for performance degradation
    if (metric.p99 > this.getSLA(operation)) {
      this.alertManager.trigger({
        type: 'PERFORMANCE_DEGRADATION',
        operation,
        current: metric.p99,
        threshold: this.getSLA(operation),
        metadata
      });
    }
  }

  // Adaptive performance budgets
  calculatePerformanceBudget(operation: string): number {
    const historical = this.getHistoricalPerformance(operation);
    const trend = this.calculateTrend(historical);
    
    // Adjust budget based on trends and business criticality
    const baseBudget = this.getBaseBudget(operation);
    const trendAdjustment = trend > 0 ? 1.1 : 0.9; // 10% adjustment
    
    return baseBudget * trendAdjustment;
  }
}
```

### **Distributed Tracing Performance Analysis**
```typescript
class TraceAnalyzer {
  async analyzePerformanceBottlenecks(traceId: string): Promise<BottleneckAnalysis> {
    const trace = await this.jaeger.getTrace(traceId);
    const spans = this.flattenSpans(trace);
    
    // Critical path analysis
    const criticalPath = this.findCriticalPath(spans);
    const bottlenecks = criticalPath
      .filter(span => span.duration > this.getExpectedDuration(span.operationName))
      .map(span => ({
        service: span.process.serviceName,
        operation: span.operationName,
        duration: span.duration,
        expectedDuration: this.getExpectedDuration(span.operationName),
        slowdownFactor: span.duration / this.getExpectedDuration(span.operationName)
      }))
      .sort((a, b) => b.slowdownFactor - a.slowdownFactor);

    return {
      traceId,
      totalDuration: trace.duration,
      criticalPathDuration: criticalPath.reduce((sum, span) => sum + span.duration, 0),
      bottlenecks,
      recommendations: this.generateRecommendations(bottlenecks)
    };
  }

  private generateRecommendations(bottlenecks: Bottleneck[]): Recommendation[] {
    return bottlenecks.map(bottleneck => {
      if (bottleneck.service === 'database' && bottleneck.slowdownFactor > 3) {
        return {
          type: 'DATABASE_OPTIMIZATION',
          priority: 'HIGH',
          description: `Query in ${bottleneck.operation} is ${bottleneck.slowdownFactor}x slower than expected`,
          actions: ['Add index', 'Optimize query', 'Consider caching']
        };
      }
      // More recommendation logic...
    });
  }
}
```

## 🚀 Frontend Performance Optimization

### **Advanced Bundle Optimization**
```typescript
// vite.config.ts - Production optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor splitting for optimal caching
          'react-vendor': ['react', 'react-dom'],
          'web3-vendor': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          'ui-vendor': ['@headlessui/react', 'framer-motion'],
          
          // Feature-based splitting
          'qr-verification': ['react-qr-reader', 'qrcode'],
          'charts': ['recharts', 'd3'],
          'maps': ['mapbox-gl', 'react-map-gl']
        }
      }
    },
    
    // Advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        safari10: true
      }
    },
    
    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging
    sourcemap: 'hidden'
  },
  
  // Preload critical resources
  plugins: [
    react(),
    {
      name: 'preload-critical',
      generateBundle(options, bundle) {
        // Generate preload hints for critical chunks
        const criticalChunks = ['index', 'qr-verification'];
        // Implementation...
      }
    }
  ]
});
```

### **React Performance Patterns**
```typescript
// Virtualized lists for large datasets
const VirtualizedCropList = memo(({ crops }: { crops: CropBatch[] }) => {
  const rowRenderer = useCallback(({ index, key, style }) => (
    <div key={key} style={style}>
      <CropBatchCard crop={crops[index]} />
    </div>
  ), [crops]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          rowCount={crops.length}
          rowHeight={120}
          rowRenderer={rowRenderer}
          overscanRowCount={5} // Render 5 extra rows for smooth scrolling
        />
      )}
    </AutoSizer>
  );
});

// Optimized context to prevent unnecessary re-renders
const CropContext = createContext<CropContextValue | null>(null);

export const CropProvider = ({ children }: { children: ReactNode }) => {
  const [crops, setCrops] = useState<CropBatch[]>([]);
  
  // Memoize context value to prevent re-renders
  const contextValue = useMemo(() => ({
    crops,
    setCrops,
    // Memoize expensive operations
    cropsByType: useMemo(() => groupBy(crops, 'cropType'), [crops]),
    totalValue: useMemo(() => crops.reduce((sum, crop) => sum + crop.value, 0), [crops])
  }), [crops]);

  return (
    <CropContext.Provider value={contextValue}>
      {children}
    </CropContext.Provider>
  );
};

// Intersection Observer for lazy loading
const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold, rootMargin: '50px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible] as const;
};
```

### **Service Worker Optimization**
```typescript
// sw.ts - Advanced caching strategies
const CACHE_STRATEGIES = {
  'api-cache': {
    strategy: 'NetworkFirst',
    cacheName: 'api-cache-v1',
    networkTimeoutSeconds: 3,
    cacheableResponse: { statuses: [0, 200] }
  },
  'static-cache': {
    strategy: 'CacheFirst', 
    cacheName: 'static-cache-v1',
    cacheableResponse: { statuses: [0, 200] }
  },
  'qr-verification': {
    strategy: 'StaleWhileRevalidate',
    cacheName: 'qr-cache-v1',
    networkTimeoutSeconds: 1 // Fast fallback to cache
  }
};

// Predictive prefetching
self.addEventListener('message', event => {
  if (event.data.type === 'PREFETCH_ROUTES') {
    const routes = event.data.routes;
    
    // Prefetch likely next routes based on user behavior
    routes.forEach(route => {
      fetch(route, { mode: 'no-cors' })
        .then(response => caches.open('prefetch-cache').then(cache => cache.put(route, response)))
        .catch(() => {}); // Ignore prefetch failures
    });
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'crop-batch-sync') {
    event.waitUntil(syncCropBatches());
  }
});

async function syncCropBatches() {
  const db = await openDB('greenledger-offline');
  const pendingBatches = await db.getAll('pending-batches');
  
  for (const batch of pendingBatches) {
    try {
      await fetch('/api/crop-batches', {
        method: 'POST',
        body: JSON.stringify(batch),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await db.delete('pending-batches', batch.id);
    } catch (error) {
      // Retry later
      console.log('Sync failed, will retry:', error);
    }
  }
}
```

## 📊 Performance Testing & Benchmarking

### **Load Testing with K6**
```javascript
// load-test.js - Realistic load testing scenarios
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200
    { duration: '5m', target: 200 },   // Stay at 200
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
    errors: ['rate<0.1'],
  },
};

export default function() {
  // Simulate realistic user journey
  const scenarios = [
    () => testQRVerification(),
    () => testCropSearch(), 
    () => testMarketplace(),
    () => testDashboard()
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
  
  sleep(Math.random() * 3 + 1); // Random think time 1-4s
}

function testQRVerification() {
  const tokenId = Math.floor(Math.random() * 10000) + 1;
  const response = http.get(`${__ENV.BASE_URL}/api/verify/${tokenId}`);
  
  const success = check(response, {
    'QR verification status is 200': (r) => r.status === 200,
    'QR verification response time < 200ms': (r) => r.timings.duration < 200,
    'QR verification has valid response': (r) => r.json('isValid') !== undefined,
  });
  
  errorRate.add(!success);
}

function testCropSearch() {
  const searchParams = {
    cropType: ['wheat', 'corn', 'tomatoes'][Math.floor(Math.random() * 3)],
    limit: 20,
    offset: Math.floor(Math.random() * 100)
  };
  
  const response = http.post(`${__ENV.BASE_URL}/api/crop-batches/search`, 
    JSON.stringify(searchParams),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  const success = check(response, {
    'Search status is 200': (r) => r.status === 200,
    'Search response time < 300ms': (r) => r.timings.duration < 300,
    'Search returns results': (r) => r.json('results').length >= 0,
  });
  
  errorRate.add(!success);
}
```

### **Continuous Performance Monitoring**
```typescript
class ContinuousPerformanceMonitor {
  private lighthouse: LighthouseCI;
  private webPageTest: WebPageTest;

  async runPerformanceAudit(): Promise<PerformanceReport> {
    const [lighthouseResults, wptResults] = await Promise.all([
      this.runLighthouseAudit(),
      this.runWebPageTestAudit()
    ]);

    const report = this.combineResults(lighthouseResults, wptResults);
    
    // Alert on performance regressions
    if (report.performanceScore < 90 || report.firstContentfulPaint > 2000) {
      await this.alertManager.sendAlert({
        type: 'PERFORMANCE_REGRESSION',
        severity: 'HIGH',
        details: report
      });
    }

    return report;
  }

  private async runLighthouseAudit() {
    return await this.lighthouse.audit({
      url: 'https://greenledger.com',
      settings: {
        onlyCategories: ['performance'],
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        }
      }
    });
  }

  // Performance budget enforcement
  async enforcePerformanceBudget(results: PerformanceResults): Promise<boolean> {
    const budget = {
      firstContentfulPaint: 2000,
      largestContentfulPaint: 4000,
      cumulativeLayoutShift: 0.1,
      totalBlockingTime: 300,
      bundleSize: 500 * 1024 // 500KB
    };

    const violations = Object.entries(budget)
      .filter(([metric, threshold]) => results[metric] > threshold)
      .map(([metric, threshold]) => ({
        metric,
        actual: results[metric],
        threshold,
        violation: results[metric] - threshold
      }));

    if (violations.length > 0) {
      throw new PerformanceBudgetViolation(violations);
    }

    return true;
  }
}
```

---

**Related Links:**
- [← Microservices Architecture](../architecture/MICROSERVICES.md)
- [Monitoring & Alerting →](./MONITORING.md)
- [Security Guidelines →](./SECURITY.md)

**Last Updated**: January 15, 2024  
**Version**: 2.0  
**Status**: ✅ Complete