import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;