import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ExpenseList from './components/Expenses/ExpenseList';
import Reports from './components/Reports/Reports';
import BudgetSetup from './components/Budget/BudgetSetup';
import CategoryManager from './components/Categories/CategoryManager';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import ContactUs from './components/Contact/ContactUs';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExpenseProvider>
          <Router>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="expenses" element={<ExpenseList />} />
                <Route path="reports" element={<Reports />} />
                <Route path="budget" element={<BudgetSetup />} />
                <Route path="categories" element={<CategoryManager />} />
                <Route path="profile" element={<Profile />} />
                <Route path="contact-us" element={<ContactUs />} />
              </Route>
            </Routes>
          </Router>
        </ExpenseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
