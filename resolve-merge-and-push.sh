#!/bin/bash

set -e

echo "Resolving merge conflicts and pushing to GitHub for GreenLedger UI..."

# Step 1: Verify working directory
if [ "$(pwd)" != "/workspaces/greenledger-ui" ]; then
  echo "Error: Script must run in /workspaces/greenledger-ui"
  exit 1
fi

# Step 2: List conflicting files
echo "Checking for conflicting files..."
git status
echo "Please resolve conflicts in files listed under 'Unmerged paths'."
echo "Opening conflicting files for manual resolution..."

# Step 3: Identify and open conflicting files
conflicting_files=$(git diff --name-only --diff-filter=U)
if [ -z "$conflicting_files" ]; then
  echo "No conflicting files found. Proceeding with merge completion."
else
  echo "Conflicting files: $conflicting_files"
  for file in $conflicting_files; do
    echo "Opening $file for conflict resolution..."
    nano "$file"
    echo "Please resolve conflicts in $file, then save and exit."
  done
fi

# Step 4: Stage resolved files
echo "Staging resolved files..."
for file in $conflicting_files; do
  git add "$file"
done

# Step 5: Complete the merge
echo "Completing the merge..."
git commit || {
  echo "Error: Merge commit failed. Please check for unresolved conflicts."
  exit 1
}

# Step 6: Verify build to ensure fixes are intact
echo "Verifying build..."
npm install
npm run build || {
  echo "Error: Build failed. Check npm run build output for details."
  exit 1
}

# Step 7: Stage additional files
echo "Staging additional files..."
git add src/config/wagmiConfig.ts fix-wallet-sdk.sh
git add patches/ vite.config.js package.json package-lock.json || echo "No changes in patches/, vite.config.js, package.json, or package-lock.json"

# Step 8: Commit additional changes
echo "Committing additional changes..."
git commit -m "Sync with remote main, include wagmiConfig.ts and fix-wallet-sdk.sh" || echo "No changes to commit"

# Step 9: Verify Git remote
echo "Verifying Git remote..."
git remote -v | grep "github.com/Green-Ledger-01/greenledger-ui" || {
  echo "Setting remote to HTTPS..."
  git remote set-url origin https://github.com/Green-Ledger-01/greenledger-ui.git
}

# Step 10: Push to GitHub
echo "Pushing to GitHub..."
git push origin main || {
  echo "Error: Push failed. Check authentication or try: git push origin main --force (use with caution)."
  exit 1
}

echo "Changes pushed successfully to https://github.com/Green-Ledger-01/greenledger-ui!"
echo "If linked to Vercel, deployment should trigger automatically. Otherwise, run: vercel deploy"
