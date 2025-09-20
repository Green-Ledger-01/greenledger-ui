#!/bin/bash

# Script to commit ESLint and build fixes file by file

echo "🔧 Committing ESLint and build fixes..."

# Add and commit CurrencyDisplay.tsx fixes
git add src/components/CurrencyDisplay.tsx
git commit -m "fix: export CURRENCY_CONFIG and convertCurrency, fix unused variables"

# Add and commit CropBatchCard.tsx fixes  
git add src/components/CropBatchCard.tsx
git commit -m "fix: add back formatDate and formatLastUpdated functions used in modal"

# Add and commit AuthenticationPage.tsx fixes
git add src/pages/AuthenticationPage.tsx
git commit -m "fix: remove undefined isConnecting variable references"

# Add and commit vite-env.d.ts fixes
git add vite-env.d.ts
git commit -m "fix: resolve Buffer and callback type issues"

# Add and commit vite.config.js fixes
git add vite.config.js
git commit -m "fix: use optional chaining for process.env access"

# Add and commit secureLogger.ts fixes
git add src/utils/secureLogger.ts
git commit -m "fix: replace control character regex with unicode escapes"

# Add and commit main.tsx fixes
git add src/main.tsx
git commit -m "fix: remove unused error parameters in catch blocks"

# Add and commit husky pre-commit fixes
git add .husky/pre-commit
git commit -m "fix: add proper shebang to shell script"

# Add and commit useCropBatchToken.ts fixes
git add src/hooks/useCropBatchToken.ts
git commit -m "fix: remove unused parseEther and formatEther imports"

# Add and commit useSupplyChainFlow.ts fixes
git add src/hooks/useSupplyChainFlow.ts
git commit -m "fix: remove unused imports and parameters"

echo "✅ All fixes committed successfully!"
echo "📊 Summary of commits:"
git log --oneline -10