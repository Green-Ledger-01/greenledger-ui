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
  Search
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
      name: 'Track Supply Chain',
      href: '/track',
      icon: Truck,
      description: 'Track batch journey'
    },
    {
      name: 'Register User',
      href: '/register',
      icon: UserPlus,
      description: 'Manage user roles'
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
        fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md shadow-2xl transform transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-lg md:border-r md:border-green-100 md:bg-white
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center">
            <div className="h-10 w-10 mr-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold gradient-text">GreenLedger</h2>
              <p className="text-xs text-gray-500">Supply Chain</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-white/50"
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
                className={({ isActive }) => `
                  flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 group hover-lift
                  ${isActive
                    ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 shadow-md border-l-4 border-green-600'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-green-700 hover:shadow-sm'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-600">
                    {item.description}
                  </div>
                </div>
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