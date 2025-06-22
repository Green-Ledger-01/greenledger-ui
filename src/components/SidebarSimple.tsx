import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Truck, 
  UserPlus, 
  X,
  Leaf
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
      name: 'Marketplace',
      href: '/marketplace',
      icon: ShoppingCart,
      description: 'Browse crop batches'
    },
    {
      name: 'Mint Batch',
      href: '/mint',
      icon: Package,
      description: 'Create new crop batch'
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
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 mr-2 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-green-800">GreenLedger</h2>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-500 hover:text-gray-700 transition-colors"
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
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-green-100 text-green-800 border-l-4 border-green-600' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-green-700'
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Agricultural Supply Chain
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by Blockchain
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarSimple;