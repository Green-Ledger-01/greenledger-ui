import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Package,
  Truck,
  UserPlus,
  X,
  Leaf,
  Shield,
  Coins,
  Send,
  Search,
  QrCode
} from 'lucide-react';

interface SidebarSimpleProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

/**
 * Simple Sidebar Component
 * 
 * A clean, responsive sidebar navigation that works without
 * complex Web3 dependencies. Provides navigation to all
 * main application features.
 */
const SidebarSimple: React.FC<SidebarSimpleProps> = ({ isOpen, toggleSidebar }) => {
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Overview and statistics'
    },
    {
      name: 'QR Verification',
      href: '/qr',
      icon: QrCode,
      description: 'Instant blockchain verification'
    },
    {
      name: 'Tokenize Crop',
      href: '/tokenize',
      icon: Coins,
      description: 'Create NFT with provenance'
    },
    {
      name: 'Transfer Ownership',
      href: '/transfer',
      icon: Send,
      description: 'Transfer tokens with tracking'
    },
    {
      name: 'Supply Chain Explorer',
      href: '/explorer',
      icon: Search,
      description: 'Explore provenance data'
    },
    {
      name: 'Marketplace',
      href: '/marketplace',
      icon: ShoppingCart,
      description: 'Browse crop batches'
    },
    {
      name: 'Checkout and Track',
      href: '/track',
      icon: Truck,
      description: 'Complete purchases and track batches'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserPlus,
      description: 'View and manage profile'
    },
    {
      name: 'Auth Test',
      href: '/auth-test',
      icon: Shield,
      description: 'Test authentication'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-xl md:border-r md:border-gray-100 md:bg-white
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center">
            <div className="h-10 w-10 mr-3 rounded-xl bg-green-600 flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-600">GreenLedger</h2>
              <p className="text-xs text-gray-500">Supply Chain</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-500 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  // Close sidebar on mobile when navigating
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
              >
                {({ isActive }) => (
                  <div className={`
                    flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-600 hover:shadow-sm'
                    }
                  `}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${
                      isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-green-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-green-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-green-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium">
              Agricultural Supply Chain
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Powered by Blockchain
            </p>
            <div className="flex justify-center mt-2">
              <div className="h-1 w-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarSimple;