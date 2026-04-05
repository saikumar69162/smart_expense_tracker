import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiList, FiPieChart, FiTarget, FiGrid, 
  FiUser, FiMail 
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { path: '/dashboard', icon: <FiHome size={20} />, label: 'Dashboard' },
    { path: '/expenses', icon: <FiList size={20} />, label: 'Expenses' },
    { path: '/reports', icon: <FiPieChart size={20} />, label: 'Reports' },
    { path: '/budget', icon: <FiTarget size={20} />, label: 'Budget' },
    { path: '/categories', icon: <FiGrid size={20} />, label: 'Categories' },
  ];
  
  const bottomItems = [
    { path: '/profile', icon: <FiUser size={20} />, label: 'Profile' },
    { path: '/contact-us', icon: <FiMail size={20} />, label: 'Contact Us' },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0 lg:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-16 lg:hidden"></div>
      <nav className="mt-4 px-4">
        <div className="space-y-1">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
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
              onClick={handleNavClick}
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
