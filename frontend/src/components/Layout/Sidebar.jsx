import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiList, FiPieChart, FiTarget, FiGrid, 
  FiSettings, FiHelpCircle 
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen }) => {
  const menuItems = [
    { path: '/dashboard', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/expenses', icon: <FiList size={20} />, label: 'Expenses' },
    { path: '/reports', icon: <FiPieChart size={20} />, label: 'Reports' },
    { path: '/budget', icon: <FiTarget size={20} />, label: 'Budget' },
    { path: '/categories', icon: <FiGrid size={20} />, label: 'Categories' },
  ];
  
  const bottomItems = [
    { path: '/settings', icon: <FiSettings size={20} />, label: 'Settings' },
    { path: '/help', icon: <FiHelpCircle size={20} />, label: 'Help' },
  ];
  
  return (
    <aside className={`fixed left-0 top-0 h-full bg-white shadow-lg z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'}`}>
      <div className="h-16"></div> {/* Spacer for navbar */}
      <nav className="mt-4 px-4">
        <div className="space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
        
        <div className="border-t my-4"></div>
        
        <div className="space-y-1">
          {bottomItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;