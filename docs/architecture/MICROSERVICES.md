# ⚡ Microservices Architecture - Event-Driven Scalability

## 🎯 Advanced Service Decomposition

### **Event Sourcing + CQRS Pattern**
```typescript
// Command-Query Responsibility Segregation
interface CropCommandService {
  execute(command: MintCropCommand): Promise<EventStream>;
  execute(command: TransferCommand): Promise<EventStream>;
}

interface CropQueryService {
  getProjection(tokenId: number): Promise<CropProjection>;
  searchProjections(query: SearchQuery): Promise<CropProjection[]>;
}

// Event Store Pattern
class EventStore {
  async append(streamId: string, events: DomainEvent[]): Promise<void> {
    // Optimistic concurrency control
    await this.timescale.query(`
      INSERT INTO event_store (stream_id, event_type, event_data, version, timestamp)
      VALUES ${events.map(e => `('${streamId}', '${e.type}', '${JSON.stringify(e.data)}', ${e.version}, NOW())`).join(',')}
    `);
  }
}
```

### **Saga Pattern for Distributed Transactions**
```typescript
class CropTransferSaga {
  async handle(event: TransferInitiated) {
    const saga = new SagaTransaction([
      new ValidateOwnership(event.tokenId, event.from),
      new UpdateBlockchain(event.tokenId, event.to),
      new UpdateProjections(event.tokenId, event.to),
      new NotifyStakeholders(event.tokenId, event.to)
    ]);
    
    return await saga.execute();
  }
}
```

## 🚀 Service Mesh Architecture

### **Istio Service Mesh Configuration**
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: crop-service
spec:
  http:
  - match:
    - headers:
        x-user-role:
          exact: farmer
    route:
    - destination:
        host: crop-service
        subset: v2
      weight: 100
  - route:
    - destination:
        host: crop-service
        subset: v1
      weight: 100
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: crop-service
spec:
  host: crop-service
  trafficPolicy:
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

### **Advanced Load Balancing**
```typescript
// Consistent Hashing for Stateful Services
class ConsistentHashRouter {
  private ring = new Map<number, string>();
  
  addNode(nodeId: string) {
    for (let i = 0; i < 150; i++) { // Virtual nodes
      const hash = this.hash(`${nodeId}:${i}`);
      this.ring.set(hash, nodeId);
    }
  }
  
  route(key: string): string {
    const hash = this.hash(key);
    const sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);
    const targetHash = sortedHashes.find(h => h >= hash) || sortedHashes[0];
    return this.ring.get(targetHash)!;
  }
}
```

## 📊 Real-Time Event Streaming

### **Apache Kafka Integration**
```typescript
class EventStreamProcessor {
  private kafka = new Kafka({
    clientId: 'greenledger-processor',
    brokers: ['kafka-1:9092', 'kafka-2:9092', 'kafka-3:9092']
  });

  async processSupplyChainEvents() {
    const consumer = this.kafka.consumer({ groupId: 'supply-chain-group' });
    
    await consumer.subscribe({ 
      topics: ['crop.minted', 'crop.transferred', 'transport.updated'],
      fromBeginning: false 
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        
        // Parallel processing with backpressure
        await this.processWithBackpressure(event, {
          maxConcurrency: 100,
          timeout: 5000
        });
      },
    });
  }

  private async processWithBackpressure(event: any, options: any) {
    // Implement semaphore-based concurrency control
    await this.semaphore.acquire();
    try {
      await Promise.race([
        this.processEvent(event),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), options.timeout)
        )
      ]);
    } finally {
      this.semaphore.release();
    }
  }
}
```

### **Event Sourcing Projections**
```sql
-- Materialized views with incremental updates
CREATE MATERIALIZED VIEW crop_ownership_projection AS
SELECT 
  token_id,
  current_owner,
  ownership_history,
  last_transfer_time,
  transfer_count
FROM (
  SELECT 
    token_id,
    LAST_VALUE(new_owner) OVER (
      PARTITION BY token_id 
      ORDER BY event_time 
      ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as current_owner,
    ARRAY_AGG(
      jsonb_build_object('owner', new_owner, 'time', event_time)
      ORDER BY event_time
    ) as ownership_history,
    MAX(event_time) as last_transfer_time,
    COUNT(*) as transfer_count
  FROM supply_chain_events 
  WHERE event_type = 'ownership_transferred'
  GROUP BY token_id
) t;

-- Trigger for incremental updates
CREATE OR REPLACE FUNCTION refresh_crop_projections()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY crop_ownership_projection;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

## 🔄 Advanced Caching Strategies

### **Multi-Level Cache Hierarchy**
```typescript
class HierarchicalCache {
  private l1 = new Map<string, any>(); // In-memory
  private l2: Redis; // Distributed
  private l3: PostgreSQL; // Persistent

  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache (sub-millisecond)
    if (this.l1.has(key)) {
      return this.l1.get(key);
    }

    // L2: Redis cache (1-5ms)
    const l2Value = await this.l2.get(key);
    if (l2Value) {
      this.l1.set(key, l2Value);
      return JSON.parse(l2Value);
    }

    // L3: Database (10-50ms)
    const l3Value = await this.l3.query('SELECT data FROM cache WHERE key = $1', [key]);
    if (l3Value.rows.length > 0) {
      const data = l3Value.rows[0].data;
      await this.l2.setex(key, 3600, JSON.stringify(data));
      this.l1.set(key, data);
      return data;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = 3600) {
    // Write-through strategy
    this.l1.set(key, value);
    await this.l2.setex(key, ttl, JSON.stringify(value));
    await this.l3.query(
      'INSERT INTO cache (key, data, expires_at) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET data = $2, expires_at = $3',
      [key, value, new Date(Date.now() + ttl * 1000)]
    );
  }
}
```

### **Predictive Caching with ML**
```typescript
class PredictiveCache {
  private mlModel: TensorFlowModel;

  async predictAndCache(userId: string, context: UserContext) {
    const predictions = await this.mlModel.predict({
      userId,
      timeOfDay: context.timeOfDay,
      location: context.location,
      recentActivity: context.recentActivity
    });

    // Pre-cache likely requests
    const likelyRequests = predictions
      .filter(p => p.probability > 0.7)
      .slice(0, 10);

    await Promise.all(
      likelyRequests.map(req => this.prefetchData(req.endpoint, req.params))
    );
  }

  private async prefetchData(endpoint: string, params: any) {
    const cacheKey = `prefetch:${endpoint}:${JSON.stringify(params)}`;
    const data = await this.fetchFromSource(endpoint, params);
    await this.cache.set(cacheKey, data, 1800); // 30 min TTL
  }
}
```

## 🎯 Service Discovery & Health Checks

### **Consul Service Discovery**
```typescript
class ServiceRegistry {
  private consul = new Consul({ host: 'consul.service.consul' });

  async registerService(service: ServiceConfig) {
    await this.consul.agent.service.register({
      id: service.id,
      name: service.name,
      tags: service.tags,
      address: service.address,
      port: service.port,
      check: {
        http: `http://${service.address}:${service.port}/health`,
        interval: '10s',
        timeout: '3s',
        deregistercriticalserviceafter: '30s'
      }
    });
  }

  async discoverService(serviceName: string): Promise<ServiceInstance[]> {
    const services = await this.consul.health.service({
      service: serviceName,
      passing: true
    });

    return services.map(s => ({
      id: s.Service.ID,
      address: s.Service.Address,
      port: s.Service.Port,
      tags: s.Service.Tags
    }));
  }
}
```

### **Circuit Breaker Pattern**
```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
      }
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

## 📊 Advanced Monitoring & Observability

### **Distributed Tracing**
```typescript
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

class TracedService {
  private tracer = trace.getTracer('crop-service');

  async processCropBatch(tokenId: number) {
    const span = this.tracer.startSpan('process_crop_batch');
    
    try {
      span.setAttributes({
        'crop.token_id': tokenId,
        'service.name': 'crop-service',
        'service.version': '2.1.0'
      });

      // Propagate trace context to downstream services
      const result = await context.with(trace.setSpan(context.active(), span), async () => {
        const cropData = await this.fetchCropData(tokenId);
        const verification = await this.verifyOwnership(tokenId);
        return { cropData, verification };
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }
}
```

### **Custom Metrics Collection**
```typescript
class MetricsCollector {
  private prometheus = require('prom-client');
  
  private cropProcessingDuration = new this.prometheus.Histogram({
    name: 'crop_processing_duration_seconds',
    help: 'Duration of crop processing operations',
    labelNames: ['operation', 'status', 'crop_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  });

  private activeConnections = new this.prometheus.Gauge({
    name: 'websocket_connections_active',
    help: 'Number of active WebSocket connections',
    labelNames: ['service', 'user_type']
  });

  recordCropProcessing(operation: string, duration: number, status: string, cropType: string) {
    this.cropProcessingDuration
      .labels(operation, status, cropType)
      .observe(duration);
  }

  incrementConnections(service: string, userType: string) {
    this.activeConnections.labels(service, userType).inc();
  }
}
```

## 🔐 Zero-Trust Security Model

### **Service-to-Service Authentication**
```typescript
class ServiceAuthenticator {
  private jwks = new Map<string, JsonWebKey>();

  async authenticateService(token: string): Promise<ServiceIdentity> {
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded.header.kid;
    
    const publicKey = await this.getPublicKey(kid);
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'greenledger-auth-service',
      audience: 'greenledger-services'
    });

    return {
      serviceId: payload.sub,
      permissions: payload.permissions,
      scopes: payload.scopes
    };
  }

  async generateServiceToken(serviceId: string, permissions: string[]): Promise<string> {
    return jwt.sign(
      {
        sub: serviceId,
        permissions,
        scopes: this.calculateScopes(permissions),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      },
      this.privateKey,
      { algorithm: 'RS256', keyid: this.keyId }
    );
  }
}
```

## 🚀 Auto-Scaling Strategies

### **Kubernetes HPA with Custom Metrics**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: crop-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: crop-service
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: crop_processing_queue_length
      target:
        type: AverageValue
        averageValue: "10"
  - type: External
    external:
      metric:
        name: redis_connections_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### **Predictive Scaling**
```typescript
class PredictiveScaler {
  private mlModel: ScalingModel;

  async predictLoad(timeHorizon: number): Promise<ScalingRecommendation> {
    const features = await this.gatherFeatures();
    const prediction = await this.mlModel.predict(features, timeHorizon);
    
    return {
      recommendedReplicas: Math.ceil(prediction.expectedLoad / this.targetCpuUtilization),
      confidence: prediction.confidence,
      reasoning: prediction.factors
    };
  }

  private async gatherFeatures() {
    return {
      currentTime: Date.now(),
      dayOfWeek: new Date().getDay(),
      seasonality: this.calculateSeasonality(),
      recentTrends: await this.getRecentMetrics(),
      externalFactors: await this.getExternalFactors()
    };
  }
}
```

---

**Related Links:**
- [← System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Database Design →](./DATABASE_DESIGN.md)
- [Performance Optimization →](../operations/PERFORMANCE.md)

**Last Updated**: January 15, 2024  
**Version**: 2.0  
**Status**: ✅ Complete