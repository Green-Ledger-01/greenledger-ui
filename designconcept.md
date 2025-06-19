"Tokenization Component (src/components/Tokenization.tsx)
import React from 'react';

const Tokenization: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
        <h2 className="text-lg font-semibold mb-2">Tokenization Form</h2>
        <form>
          <div className="mb-2">
            <label className="block text-gray-600">Produce Name</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Description</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Harvest Date</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Location</label>
            <select className="w-full p-2 border rounded">
              <option>Location</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Quantity</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Mint Token</button>
        </form>
      </div>
    </div>
  );
};

export default Tokenization;

"
"Transactions Component (src/components/Transactions.tsx)
import React from 'react';

const Transactions: React.FC = () => {
  const transactions = [
    { id: '1', from: 'Farmer', to: 'Distributor', tokenId: '4-Z', date: '2025-06-15' },
    { id: '2', from: 'Distributor', to: 'Retailer', tokenId: '5-A', date: '2025-06-16' },
  ];
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Supply Chain Transactions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <p className="text-gray-600">{tx.from} → {tx.to}</p>
            <p className="text-gray-600">Token ID: {tx.tokenId}</p>
            <p className="text-gray-600">Date: {tx.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;

"
Setup Script (setup-components.sh
#!/bin/bash

# Set error handling
set -e

# Timestamp
echo "Starting setup at 11:07 AM WAT, Wednesday, June 18, 2025..."

# Step 1: Verify working directory
EXPECTED_DIR="/mnt/c/Users/user/Documents/GitHub/greenledger-ui"
if [ "$(pwd)" != "$EXPECTED_DIR" ]; then
  echo "Error: Script must run in $EXPECTED_DIR"
  exit 1
fi

# Step 2: Check for Bun and install dependencies
if ! command -v bun &> /dev/null; then
  echo "Error: Bun is required. Install from https://bun.sh/"
  exit 1
fi
bun install react react-dom @types/react @types/react-dom typescript > /dev/null 2>&1
echo "Installed or verified dependencies with Bun."

# Step 3: Create components directory if it doesn't exist
if [ ! -d "src/components" ]; then
  mkdir -p src/components
  echo "Created src/components directory."
else
  echo "src/components directory already exists."
fi

# Step 4: Create Marketplace.tsx
if [ ! -f "src/components/Marketplace.tsx" ]; then
cat > src/components/Marketplace.tsx << 'EOF'
import React from 'react';

const Marketplace: React.FC = () => {
  const batches = [
    { id: '1', name: 'Corn Batch', tokenId: '4-Z', metadata: 'Harvested 2025-06-01' },
    { id: '2', name: 'Wheat Batch', tokenId: '5-A', metadata: 'Harvested 2025-06-02' },
  ];
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Marketplace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <h3 className="text-lg font-semibold">{batch.name}</h3>
            <p className="text-gray-600">Token ID: {batch.tokenId}</p>
            <p className="text-gray-600">{batch.metadata}</p>
            <button className="mt-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
EOF
  echo "Created src/components/Marketplace.tsx."
else
  echo "src/components/Marketplace.tsx already exists. Skipping."
fi

# Step 5: Create Transactions.tsx
if [ ! -f "src/components/Transactions.tsx" ]; then
cat > src/components/Transactions.tsx << 'EOF'
import React from 'react';

const Transactions: React.FC = () => {
  const transactions = [
    { id: '1', from: 'Farmer', to: 'Distributor', tokenId: '4-Z', date: '2025-06-15' },
    { id: '2', from: 'Distributor', to: 'Retailer', tokenId: '5-A', date: '2025-06-16' },
  ];
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Supply Chain Transactions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <p className="text-gray-600">{tx.from} → {tx.to}</p>
            <p className="text-gray-600">Token ID: {tx.tokenId}</p>
            <p className="text-gray-600">Date: {tx.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
EOF
  echo "Created src/components/Transactions.tsx."
else
  echo "src/components/Transactions.tsx already exists. Skipping."
fi

# Step 6: Create Tokenization.tsx
if [ ! -f "src/components/Tokenization.tsx" ]; then
cat > src/components/Tokenization.tsx << 'EOF'
import React from 'react';

const Tokenization: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
        <h2 className="text-lg font-semibold mb-2">Tokenization Form</h2>
        <form>
          <div className="mb-2">
            <label className="block text-gray-600">Produce Name</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Description</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Harvest Date</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Location</label>
            <select className="w-full p-2 border rounded">
              <option>Location</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Quantity</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Mint Token</button>
        </form>
      </div>
    </div>
  );
};

export default Tokenization;
EOF
  echo "Created src/components/Tokenization.tsx."
else
  echo "src/components/Tokenization.tsx already exists. Skipping."
fi

# Step 7: Create TransferOwnership.tsx
if [ ! -f "src/components/TransferOwnership.tsx" ]; then
cat > src/components/TransferOwnership.tsx << 'EOF'
import React from 'react';

const TransferOwnership: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
        <h2 className="text-lg font-semibold mb-2">Transfer Ownership</h2>
        <form>
          <div className="mb-2">
            <label className="block text-gray-600">Select Produce Token</label>
            <select className="w-full p-2 border rounded">
              <option>XXXX</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Wallet Address</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Confirm Transaction</button>
        </form>
      </div>
    </div>
  );
};

export default TransferOwnership;
EOF
  echo "Created src/components/TransferOwnership.tsx."
else
  echo "src/components/TransferOwnership.tsx already exists. Skipping."
fi

# Step 8: Update or create App.tsx
if [ -f "src/App.js" ]; then
  cp src/App.js src/App.js.bak
  rm src/App.js
fi
if [ ! -f "src/App.tsx" ]; then
cat > src/App.tsx << 'EOF'
import React from 'react';
import Marketplace from './components/Marketplace';
import Transactions from './components/Transactions';
import Tokenization from './components/Tokenization';
import TransferOwnership from './components/TransferOwnership';

const App: React.FC = () => {
  return (
    <div className="App">
      <Tokenization />
      <TransferOwnership />
      <Marketplace />
      <Transactions />
    </div>
  );
};

export default App;
EOF
  echo "Created and updated src/App.tsx. Backup of App.js at src/App.js.bak."
else
  echo "Updated existing src/App.tsx."
fi

# Step 9: Final instructions
echo "Setup complete! Commit and push:"
echo "1. git add src/components/Marketplace.tsx src/components/Transactions.tsx src/components/Tokenization.tsx src/components/TransferOwnership.tsx src/App.tsx"
echo "2. git commit -m 'Add Marketplace, Transactions, update forms to cards with hover as .tsx'"
echo "3. git push origin main (if error, run: git pull origin main, then git push origin main)"
echo "4. Test: bun run dev | Verify: https://greenledger-ui-two.vercel.app/"

# Keep terminal open
read -p "Press Enter to exit..."

"
"
Transfer Ownership Component (src/components/TransferOwnership.tsx)
import React from 'react';

const TransferOwnership: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
        <h2 className="text-lg font-semibold mb-2">Transfer Ownership</h2>
        <form>
          <div className="mb-2">
            <label className="block text-gray-600">Select Produce Token</label>
            <select className="w-full p-2 border rounded">
              <option>XXXX</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-gray-600">Wallet Address</label>
            <input className="w-full p-2 border rounded" type="text" placeholder="XXXX" />
          </div>
          <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Confirm Transaction</button>
        </form>
      </div>
    </div>
  );
};

export default TransferOwnership;
"
"
App Component (src/App.tsx)
import React from 'react';
import Marketplace from './components/Marketplace';
import Transactions from './components/Transactions';
import Tokenization from './components/Tokenization';
import TransferOwnership from './components/TransferOwnership';

const App: React.FC = () => {
  return (
    <div className="App">
      <Tokenization />
      <TransferOwnership />
      <Marketplace />
      <Transactions />
    </div>
  );
};

export default App;
Bash this


Run: 
bash
CollapseWrapRun
Copy
chmod +x setup-components.sh
Run the Script: 
bash
CollapseWrapRun
Copy
./setup-components.sh
Follow the on-screen instructions to commit and push.
Test with bun run dev and verify at https://greenledger-ui-two.vercel.app/.
Notes
Dependencies: The script installs React and TypeScript types via Bun.
Path: Uses WSL-compatible paths (/mnt/c/...); adjust if using a different environment.
Git: Required for commit/push (install from https://git-scm.com/ if missing).

"