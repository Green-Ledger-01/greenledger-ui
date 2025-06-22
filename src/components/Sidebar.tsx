import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, Home, Plus, Store, UserPlus, BarChart3, Truck } from 'lucide-react';
import clsx from 'clsx';
import { useSimpleWeb3 } from '../contexts/SimpleWeb3Context';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  description?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { userRoles } = useSimpleWeb3();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { 
      name: 'Dashboard', 
      path: '/', 
      icon: Home,
      description: 'Overview and analytics'
    },
    { 
      name: 'Mint Batch', 
      path: '/mint', 
      icon: Plus,
      roles: ['farmer', 'admin'],
      description: 'Create new crop batches'
    },
    { 
      name: 'Marketplace', 
      path: '/marketplace', 
      icon: Store,
      description: 'Browse crop batches'
    },
    { 
      name: 'Register Role', 
      path: '/register', 
      icon: UserPlus,
      roles: ['admin'],
      description: 'Manage user roles'
    },
    { 
      name: 'Track Supply Chain', 
      path: '/track', 
      icon: Truck,
      description: 'Track batch movements'
    },
    // Future features
    // { 
    //   name: 'Reports', 
    //   path: '/reports', 
    //   icon: BarChart3,
    //   roles: ['admin', 'buyer'],
    //   description: 'Analytics and reports'
    // },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    toggleSidebar(); // Close sidebar on mobile after navigation
  };

  const hasRequiredRole = (item: NavItem) => {
    if (!item.roles) return true; // No role requirement
    return item.roles.some(role => {
      const roleKey = `is${role.charAt(0).toUpperCase() + role.slice(1)}` as keyof typeof userRoles;
      return userRoles[roleKey];
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        "fixed top-0 left-0 h-full bg-gradient-to-b from-green-900 to-green-800 text-white w-64 p-6 transition-transform duration-300 ease-in-out z-30",
        "md:relative md:translate-x-0 md:flex-shrink-0 md:shadow-lg",
        {
          'translate-x-0': isOpen,
          '-translate-x-full': !isOpen,
        }
      )}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Navigation</h2>
          <button 
            onClick={toggleSidebar} 
            className="md:hidden text-white hover:text-green-200 focus:outline-none transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const hasRole = hasRequiredRole(item);
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <div key={item.path}>
                <button
                  onClick={() => hasRole && handleNavigation(item.path)}
                  disabled={!hasRole}
                  className={clsx(
                    "w-full text-left flex items-center p-3 rounded-lg transition-all duration-200 group",
                    "focus:outline-none focus:ring-2 focus:ring-green-400",
                    {
                      'bg-green-700 shadow-md': isActive,
                      'hover:bg-green-700 hover:shadow-md': !isActive && hasRole,
                      'opacity-50 cursor-not-allowed': !hasRole,
                      'text-green-100': !hasRole,
                    }
                  )}
                >
                  <Icon className={clsx(
                    "h-5 w-5 mr-3 transition-colors",
                    {
                      'text-green-200': isActive,
                      'text-green-300 group-hover:text-green-200': !isActive && hasRole,
                      'text-green-400': !hasRole,
                    }
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-green-200 opacity-75">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {!hasRole && item.roles && (
                    <div className="text-xs text-green-400 opacity-75">
                      {item.roles.join('/')}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="text-xs text-green-200 opacity-75 text-center">
            <p>GreenLedger v1.0</p>
            <p>Blockchain Supply Chain</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;