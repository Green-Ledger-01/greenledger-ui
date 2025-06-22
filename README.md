# GreenLedger UI - Blockchain Agricultural Supply Chain Tracker

A modern, responsive React application for tracking agricultural supply chains using blockchain technology. Built with TypeScript, Tailwind CSS, and Web3 integration.

## 🌟 Features

### Core Functionality
- **Blockchain Integration**: Full Web3 support with Wagmi and RainbowKit
- **Role-Based Access Control**: Farmer, Transporter, Buyer, and Admin roles
- **NFT Minting**: Create crop batch NFTs with IPFS metadata storage
- **Supply Chain Tracking**: Track produce from farm to table
- **Marketplace**: Browse and explore crop batches

### UI/UX Features
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Toast Notifications**: Real-time feedback for user actions
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton screens and loading indicators
- **Form Validation**: Real-time validation with contextual error messages

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── CropBatchCard.tsx
│   ├── CropBatchCardSkeleton.tsx
│   ├── ErrorBoundary.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── contexts/           # React contexts for state management
│   ├── ToastContext.tsx
│   └── Web3Context.tsx
├── hooks/              # Custom React hooks
│   ├── useCropBatchToken.ts
│   └── useUserManagement.ts
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Marketplace.tsx
│   ├── MintCropBatch.tsx
│   └── RegisterUser.tsx
├── utils/              # Utility functions
│   ├── errorHandling.ts
│   └── ipfs.ts
├── config/             # Configuration files
│   ├── constants.ts
│   └── wagmiConfig.ts
├── routes/             # Routing configuration
│   └── AppRoutes.tsx
├── contracts/          # Smart contract ABIs
├── chains/             # Blockchain network configurations
└── assets/             # Static assets
```

### Key Technologies
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Wagmi** for Web3 integration
- **RainbowKit** for wallet connections
- **React Router** for navigation
- **Lucide React** for icons
- **TanStack Query** for data fetching

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Green-Ledger-01/greenledger-ui
   cd greenledger-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Contract Addresses
   VITE_USER_MANAGEMENT_CONTRACT=0x...
   VITE_CROP_BATCH_TOKEN_CONTRACT=0x...
   
   # WalletConnect Project ID
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   
   # IPFS/Pinata Configuration
   VITE_PINATA_API_KEY=your_api_key
   VITE_PINATA_SECRET_API_KEY=your_secret_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Smart Contracts
Update contract addresses in `src/config/constants.ts`:
```typescript
export const CONTRACT_ADDRESSES = {
  UserManagement: 'YOUR_USER_MANAGEMENT_CONTRACT_ADDRESS',
  CropBatchToken: 'YOUR_CROP_BATCH_TOKEN_CONTRACT_ADDRESS',
};
```

### IPFS Configuration
Configure IPFS settings for metadata storage:
```typescript
export const IPFS_CONFIG = {
  PINATA_API_KEY: process.env.VITE_PINATA_API_KEY,
  PINATA_SECRET_API_KEY: process.env.VITE_PINATA_SECRET_API_KEY,
  GATEWAY: 'https://gateway.pinata.cloud/ipfs',
};
```

### Blockchain Networks
Add or modify blockchain networks in `src/chains/`:
```typescript
export const liskSepolia = {
  id: 4202,
  name: 'Lisk Sepolia Testnet',
  // ... network configuration
};
```

## 📱 User Roles & Permissions

### Role Hierarchy
1. **Admin**: Full system access, can register users and manage roles
2. **Farmer**: Can mint new crop batch NFTs
3. **Transporter**: Can transfer batches in supply chain
4. **Buyer**: Can purchase and receive crop batches

### Role-Based Features
- **Dashboard**: Available to all users
- **Mint Batch**: Farmers and Admins only
- **Register Role**: Admins only
- **Marketplace**: Available to all users

## 🎨 UI Components

### Core Components

#### CropBatchCard
Displays crop batch information with:
- Image with fallback placeholders
- Batch metadata (type, quantity, farm, date)
- Certification badges
- Interactive hover effects

#### Toast System
Real-time notifications for:
- Success messages (green)
- Error messages (red)
- Warning messages (yellow)
- Info messages (blue)

#### Responsive Sidebar
- Desktop: Always visible sidebar
- Mobile: Collapsible hamburger menu
- Role-based navigation items

### Design System
- **Colors**: Green-focused palette for agricultural theme
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent spacing using Tailwind utilities
- **Animations**: Smooth transitions and hover effects

## 🔐 Security Features

### Access Control
- Role-based component rendering
- Smart contract permission validation
- Wallet connection requirements

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Graceful fallbacks for failed operations

### Form Validation
- Real-time field validation
- File type and size restrictions
- Required field enforcement

## 🧪 Testing

### Running Tests
```bash
npm run test
```

### Test Coverage
- Component unit tests
- Hook testing
- Integration tests for Web3 interactions
- E2E tests for critical user flows

## 📦 Building for Production

### Build Command
```bash
npm run build
```

### Deployment
The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment:
- Contract addresses
- API keys
- Network configurations

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use functional components with hooks
3. Implement proper error handling
4. Write comprehensive tests
5. Follow the established code structure

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React best practices
- Use semantic commit messages
- Document complex functions and components

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🔄 Updates and Roadmap

### Current Version: 1.0.0
- ✅ Basic UI implementation
- ✅ Web3 integration
- ✅ Role-based access control
- ✅ IPFS metadata storage
- ✅ Responsive design

### Upcoming Features
- 🔄 Advanced supply chain tracking
- 🔄 Analytics dashboard
- 🔄 Mobile app
- 🔄 Multi-language support
- 🔄 Dark mode toggle

---

Built with ❤️ for sustainable agriculture and blockchain technology.
