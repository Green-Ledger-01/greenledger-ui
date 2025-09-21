# 🔧 Performance Fixes Troubleshooting Guide

## 🎯 Quick Reference

**Issue Type**: Performance & Stability Fixes  
**Severity**: CRITICAL  
**Status**: ✅ RESOLVED  
**Fix Version**: v1.2.0  

## 🚨 Symptoms & Quick Fixes

### **Browser Freezing / Infinite Re-renders**

**Symptoms**:
- Browser becomes unresponsive
- High CPU usage (>90%)
- React DevTools shows excessive re-renders
- Console shows repeated function calls

**Quick Fix**:
```bash
# 1. Check if you're on the fixed version
git log --oneline | grep "fix: infinite re-render"

# 2. If not, pull latest fixes
git pull origin main
npm install

# 3. Clear browser cache
# Chrome: Ctrl+Shift+R (hard refresh)
# Firefox: Ctrl+F5
```

**Root Cause**: `useCropBatchTokens` hook had `getAllBatches` in useEffect dependency array.

### **Slow Page Loading (>5 seconds)**

**Symptoms**:
- Dashboard takes >5 seconds to load
- Network tab shows many sequential requests
- Blockchain queries timeout

**Quick Fix**:
```bash
# 1. Verify optimized queries are active
grep -r "BLOCK_RANGE_LIMIT" src/hooks/
# Should show: const BLOCK_RANGE_LIMIT = 10000;

# 2. Check parallel processing
grep -r "Promise.allSettled" src/hooks/
# Should show parallel batch processing

# 3. Clear cache and test
localStorage.clear()
```

**Root Cause**: Sequential blockchain queries and full history scanning.

### **High Memory Usage / Memory Leaks**

**Symptoms**:
- Memory usage continuously increases
- Browser becomes sluggish over time
- Tab crashes after extended use

**Quick Fix**:
```bash
# 1. Check cache implementation
grep -r "batchCache" src/hooks/
# Should show cache with expiration

# 2. Monitor memory in DevTools
# Chrome DevTools > Memory tab > Take heap snapshot
# Look for growing objects over time

# 3. Restart application
# Close tab and reopen
```

**Root Cause**: Missing cache cleanup and memory management.

## 🔍 Detailed Diagnostics

### **1. Infinite Re-render Detection**

**Check Current Implementation**:
```typescript
// ✅ CORRECT (Fixed version)
useEffect(() => {
  const fetchData = async () => {
    try {
      const batches = await memoizedGetAllBatches();
      setData(batches);
    } catch (error) {
      secureError('Failed to fetch batches:', error);
    }
  };
  fetchData();
}, [refreshTrigger]); // ✅ Stable dependency

// ❌ INCORRECT (Broken version)
useEffect(() => {
  const fetchData = async () => {
    const batches = await getAllBatches();
    setData(batches);
  };
  fetchData();
}, [getAllBatches]); // ❌ Function recreated every render
```

**Verification Steps**:
1. Open React DevTools
2. Go to Profiler tab
3. Start recording
4. Navigate to Dashboard
5. Stop recording
6. Look for excessive re-renders of `useCropBatchTokens`

### **2. Blockchain Query Performance**

**Check Optimization Status**:
```bash
# Verify block range optimization
grep -A 5 -B 5 "fromBlock.*currentBlock" src/hooks/useCropBatchToken.ts

# Should show:
# const fromBlock = currentBlock > BLOCK_RANGE_LIMIT ? 
#   currentBlock - BigInt(BLOCK_RANGE_LIMIT) : 0n;
```

**Performance Testing**:
```javascript
// Run in browser console
console.time('blockchain-query');
// Navigate to dashboard
console.timeEnd('blockchain-query');
// Should be <3 seconds
```

### **3. Cache Effectiveness**

**Check Cache Implementation**:
```typescript
// Verify cache is working
const getCachedBatch = (tokenId: number): CropBatch | null => {
  const cached = batchCache.get(tokenId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data; // ✅ Cache hit
  }
  return null; // Cache miss
};
```

**Cache Monitoring**:
```javascript
// Run in browser console to check cache status
window.batchCacheStats = () => {
  console.log('Cache size:', batchCache.size);
  console.log('Cache entries:', Array.from(batchCache.entries()));
};
```

## 🛠️ Manual Verification Steps

### **Step 1: Verify Fix Installation**

```bash
# 1. Check git commit history
git log --oneline -10 | grep -E "(fix|perf|optimize)"

# Should show recent commits like:
# abc1234 fix: infinite re-render loop in useCropBatchTokens
# def5678 perf: optimize blockchain queries with parallel processing
# ghi9012 feat: add intelligent caching system

# 2. Verify file modifications
git diff HEAD~5 src/hooks/useCropBatchToken.ts | grep -E "(\+|\-)"

# 3. Check package versions
npm list react react-dom
# Should show React 18.3.1
```

### **Step 2: Performance Testing**

```bash
# 1. Install performance testing tools
npm install -g lighthouse

# 2. Run Lighthouse audit
lighthouse http://localhost:5173 --only-categories=performance

# 3. Check key metrics:
# - First Contentful Paint: <2s
# - Largest Contentful Paint: <4s
# - Performance Score: >90
```

### **Step 3: Memory Leak Testing**

```javascript
// Run in browser console for 5 minutes
let memoryTest = setInterval(() => {
  const memory = performance.memory;
  console.log({
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
  });
}, 30000); // Every 30 seconds

// Stop test after 5 minutes
setTimeout(() => clearInterval(memoryTest), 300000);
```

## 🔄 Rollback Procedures

### **If Issues Persist After Fixes**

**Emergency Rollback**:
```bash
# 1. Identify last working commit
git log --oneline | head -20

# 2. Create backup branch
git checkout -b backup-current-state

# 3. Rollback to stable version
git checkout main
git reset --hard <last-working-commit>

# 4. Force push (if necessary)
git push --force-with-lease origin main
```

**Gradual Rollback**:
```bash
# 1. Revert specific commits
git revert <commit-hash-of-problematic-fix>

# 2. Test individual reverts
npm run dev
# Test functionality

# 3. Commit working state
git commit -m "revert: problematic performance fix"
```

## 📊 Performance Monitoring

### **Real-time Monitoring Setup**

```typescript
// Add to main.tsx for production monitoring
if (process.env.NODE_ENV === 'production') {
  // Monitor performance
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        console.log('Page Load Time:', entry.duration);
        
        // Alert if >3 seconds
        if (entry.duration > 3000) {
          console.warn('SLOW PAGE LOAD:', entry.duration + 'ms');
        }
      }
    }
  });
  
  observer.observe({ entryTypes: ['navigation'] });
}
```

### **Error Tracking**

```typescript
// Enhanced error tracking
window.addEventListener('error', (event) => {
  console.error('Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
```

## 🚀 Performance Best Practices

### **Do's**
- ✅ Use `useMemo` and `useCallback` for expensive operations
- ✅ Implement proper dependency arrays in `useEffect`
- ✅ Use `Promise.allSettled` for parallel async operations
- ✅ Implement caching for frequently accessed data
- ✅ Optimize blockchain queries with block range limits
- ✅ Add comprehensive error handling

### **Don'ts**
- ❌ Include functions in `useEffect` dependency arrays
- ❌ Use sequential async operations in loops
- ❌ Query entire blockchain history without limits
- ❌ Ignore error handling in async operations
- ❌ Create new objects/functions in render methods
- ❌ Skip memoization for expensive computations

## 📞 Support & Escalation

### **Self-Service Debugging**

1. **Check Browser Console**: Look for errors or warnings
2. **React DevTools**: Profile component re-renders
3. **Network Tab**: Monitor API call patterns
4. **Memory Tab**: Check for memory leaks
5. **Performance Tab**: Analyze runtime performance

### **When to Escalate**

- Performance score <80 after fixes
- Memory usage >500MB after 1 hour
- Page load time >5 seconds consistently
- Browser crashes or freezing
- Error rate >5% in production

### **Escalation Contacts**

- **Technical Lead**: For architectural decisions
- **Performance Team**: For optimization strategies  
- **DevOps Team**: For infrastructure issues
- **QA Team**: For testing and validation

---

**Last Updated**: January 15, 2024  
**Version**: 1.0  
**Next Review**: February 15, 2024  

**Related Documentation**:
- [Performance Optimization Fixes](../operations/PERFORMANCE_OPTIMIZATION_FIXES.md)
- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
- [Development Setup](../guides/DEVELOPMENT_SETUP.md)