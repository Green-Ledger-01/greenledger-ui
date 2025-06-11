# 🌱 GreenLedger - Tokenized Agricultural Supply Chain

**Bringing Trust to Agriculture with Blockchain Technology**

GreenLedger is a comprehensive Web3 DApp that revolutionizes agricultural supply chain management through tokenization, transparency, and traceability. Track your produce from farm to table with immutable blockchain records.

## 🎯 Project Overview

**Mission**: Transform agricultural supply chains by providing transparent, verifiable, and trustworthy tracking of farm produce through blockchain technology.

**Vision**: Create a world where consumers can trace their food's complete journey, farmers get fair recognition, and supply chain stakeholders operate with complete transparency.

## ✨ Key Features

### 🔐 **Multi-Role Authentication**
- **Wallet Integration**: MetaMask, WalletConnect support
- **Role-Based Access**: Farmer, Distributor, Retailer, Consumer roles
- **Smart Contract Registration**: On-chain user management

### 🏷️ **Produce Tokenization**
- **NFT Creation**: ERC1155 tokens for produce batches
- **Metadata Storage**: IPFS integration for images and documents
- **Batch Details**: Crop type, quantity, harvest date, origin farm

### 🔄 **Ownership Transfer**
- **Seamless Handoffs**: Transfer tokens between supply chain actors
- **Transaction History**: Complete audit trail on blockchain
- **Smart Contract Execution**: Automated and secure transfers

### 🔍 **Supply Chain Explorer**
- **Full Traceability**: Track any product's complete journey
- **Visual Chain Graph**: Interactive supply chain visualization
- **Public Transparency**: Open access to verified supply chain data

### 📊 **Role-Specific Dashboards**
- **Asset Management**: View owned produce tokens
- **Transaction History**: Complete record of all activities
- **Quick Actions**: Role-appropriate functionality

## 🛠️ Tech Stack

### **Frontend**
- **React 19** with TypeScript
- **TailwindCSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### **Web3 Integration**
- **Wagmi v2** for Ethereum interactions
- **RainbowKit** for wallet connections
- **Viem** for blockchain utilities
- **Ethers.js** for contract interactions

### **Smart Contracts**
- **CropBatchToken**: ERC1155 NFT contract for produce tokenization
- **UserManagement**: Role-based access control system
- **Lisk Sepolia**: Testnet deployment

### **Development Tools**
- **Vite** for build tooling
- **ESLint** for code quality
- **PostCSS** with Autoprefixer

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Smart Contracts │    │      IPFS       │
│                 │    │                  │    │                 │
│ • React Pages   │◄──►│ • CropBatchToken │◄──►│ • Metadata      │
│ • Components    │    │ • UserManagement │    │ • Images        │
│ • Web3 Hooks    │    │ • Role System    │    │ • Documents     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────────────────┐
                    │    Blockchain Network   │
                    │   (Lisk Sepolia)        │
                    └─────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Green-Ledger-01/greenledger-ui.git
   cd greenledger-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Environment Setup

Create a `.env.local` file:
```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_CONTRACT_ADDRESS_CROP=0x801055F1dD9C0CFC91B2834eEE2b28662803beB5
VITE_CONTRACT_ADDRESS_USER=0xACb3006347dAEa28a511733840999d040aABf9aA 
```

## 📱 User Journey

### 1. **Landing & Connection**
- Professional landing page with feature highlights
- Wallet connection with role selection
- User registration on smart contract

### 2. **Role-Based Experience**

#### 👨‍🌾 **Farmers**
- Register new produce batches
- Upload harvest details and images
- Mint NFT tokens for crops
- Transfer to distributors

#### 🚛 **Distributors**
- Receive tokens from farmers
- Update logistics information
- Transfer to retailers
- Track inventory

#### 🏪 **Retailers**
- Receive from distributors
- Manage store inventory
- Transfer to consumers
- Display product origins

#### 👥 **Consumers**
- Purchase tokenized products
- View complete supply chain history
- Verify product authenticity
- Access detailed metadata

### 3. **Supply Chain Tracking**
- Search by token ID or product name
- Visual chain representation
- Complete transaction history
- Metadata and documentation access

## 🎨 UI/UX Design

### **Design Principles**
- **Clean & Modern**: Professional agricultural aesthetic
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG compliant interface
- **Intuitive Navigation**: Role-based UI adaptation

### **Color Scheme**
- **Primary Green**: `#16a34a` (green-600)
- **Secondary Green**: `#15803d` (green-700)
- **Accent**: `#22c55e` (green-500)
- **Background**: Gradient from green-50 to green-100

### **Components**
- Feature cards with hover effects
- Interactive supply chain visualization
- Mobile-optimized navigation
- Professional form designs

## 🔧 Development

### **Available Scripts**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Project Structure**
```
src/
├── components/          # Reusable UI components
│   ├── ConnectWallet.tsx
│   └── NavBar.tsx
├── pages/              # Main application pages
│   ├── Login.tsx       # Enhanced landing page
│   ├── Dashboard.tsx   # Role-based dashboard
│   ├── Tokenization.tsx
│   ├── TransferOwnership.tsx
│   └── SupplyChainExplorer.tsx
├── contracts/          # Smart contract ABIs
│   ├── CropBatchToken.json
│   └── UserManagement.json
├── config/             # Configuration files
├── utils/              # Utility functions
└── routes/             # Application routing
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
