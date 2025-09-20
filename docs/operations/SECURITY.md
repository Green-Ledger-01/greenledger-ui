# 🔒 GreenLedger Security Guide

## 🚨 Security Deployment Checklist

### ✅ Pre-Deployment Security Verification

#### **Environment Variables**
- [ ] All hardcoded credentials removed from codebase
- [ ] `.env` file configured with production values
- [ ] `.env` file excluded from version control
- [ ] Environment variables validated in production

#### **Code Security**
- [ ] ESLint security rules passing
- [ ] No debug components in production build
- [ ] Secure logging implemented (no sensitive data in logs)
- [ ] Constant-time comparison used for authentication

#### **Build Security**
- [ ] Production build created with `npm run build`
- [ ] Source maps disabled in production
- [ ] Debug mode disabled (`NODE_ENV=production`)
- [ ] Bundle analyzed for security issues

#### **Deployment Security**
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented

## 🛡️ Security Best Practices

### **Credential Management**
```bash
# ✅ Good - Use environment variables
const apiKey = import.meta.env.VITE_APP_PINATA_API_KEY;

# ❌ Bad - Hardcoded credentials
const apiKey = "pk_12345...";
```

### **Secure Logging**
```typescript
// ✅ Good - Sanitized logging
import { secureLog } from './utils/secureLogger';
secureLog('User action', userInput);

// ❌ Bad - Direct logging
console.log('User input:', userInput);
```

### **Authentication Comparison**
```typescript
// ✅ Good - Constant-time comparison
import { secureCompare } from './utils/secureComparison';
if (secureCompare(inputPassword, storedPassword)) { ... }

// ❌ Bad - Timing attack vulnerable
if (inputPassword === storedPassword) { ... }
```

## 🔧 Security Tools

### **ESLint Security Rules**
- `security/detect-hardcoded-credentials` - Prevents credential commits
- `security/detect-unsafe-regex` - Prevents ReDoS attacks
- `security/detect-eval-with-expression` - Prevents code injection

### **Pre-commit Hooks**
- Credential scanning before commits
- ESLint security checks
- Automatic security validation

## 🚨 Incident Response

### **If Credentials Are Compromised**
1. **Immediately rotate** all affected API keys
2. **Revoke access** for compromised credentials
3. **Audit logs** for unauthorized access
4. **Update environment variables** in all environments
5. **Force re-deployment** with new credentials

### **Security Issue Reporting**
- Report security issues privately
- Include steps to reproduce
- Provide impact assessment
- Suggest mitigation strategies

## 📋 Environment Setup

### **Development Environment**
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Fill in development values
nano .env

# 3. Install dependencies
npm install

# 4. Run security checks
npm run lint
```

### **Production Environment**
```bash
# 1. Set production environment variables
export NODE_ENV=production
export VITE_WALLETCONNECT_PROJECT_ID="prod_value"
export VITE_APP_PINATA_API_KEY="prod_value"
# ... other variables

# 2. Build for production
npm run build

# 3. Verify security
npm run lint
```

## 🔍 Security Monitoring

### **Regular Security Tasks**
- [ ] Weekly credential rotation
- [ ] Monthly security audit
- [ ] Quarterly dependency updates
- [ ] Annual security review

### **Automated Monitoring**
- Pre-commit credential scanning
- ESLint security rule enforcement
- Dependency vulnerability scanning
- Build-time security checks

---

**🔒 Remember: Security is everyone's responsibility. When in doubt, ask for a security review.**