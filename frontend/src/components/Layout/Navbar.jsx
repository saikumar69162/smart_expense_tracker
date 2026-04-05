import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import { getRelativeTime } from '../../utils/formatters';
import { FiMenu, FiUser, FiLogOut, FiChevronDown, FiBell, FiCheckCircle } from 'react-icons/fi';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  const toggleNotifications = () => {
    setShowNotifications((current) => !current);
    setShowDropdown(false);
  };
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <FiMenu size={24} className="text-gray-600" />
          </button>
          <div className="ml-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Smart Expense Tracker
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiBell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-lg shadow-lg border overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                  </div>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                          notification.read ? 'bg-white' : 'bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                            <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
                            <p className="mt-2 text-[11px] text-gray-400">{getRelativeTime(notification.createdAt)}</p>
                          </div>
                          {!notification.read && (
                            <FiCheckCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <FiUser className="text-white" size={16} />
              </div>
              <span className="text-gray-700 hidden md:inline">{user?.name}</span>
              <FiChevronDown size={16} className="text-gray-600" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 animate-fade-in">
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FiUser size={16} className="mr-2" />
                  Profile
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                >
                  <FiLogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
