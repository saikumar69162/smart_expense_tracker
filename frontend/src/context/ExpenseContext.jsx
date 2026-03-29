import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    category: '',
    minAmount: '',
    maxAmount: ''
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenses();
      fetchCategories();
      fetchBudget();
    }
  }, [isAuthenticated]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await axios.post('/api/expenses', expenseData);
      setExpenses(prev => [response.data, ...prev]);
      toast.success('Expense added successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
      throw error;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await axios.put(`/api/expenses/${id}`, expenseData);
      setExpenses(prev => prev.map(exp => exp.id === id ? response.data : exp));
      toast.success('Expense updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Set default categories if API fails
      setCategories([
        { id: 1, name: 'Food', icon: '🍔', color: '#ef4444' },
        { id: 2, name: 'Transportation', icon: '🚗', color: '#3b82f6' },
        { id: 3, name: 'Shopping', icon: '🛍️', color: '#10b981' },
        { id: 4, name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
        { id: 5, name: 'Utilities', icon: '💡', color: '#8b5cf6' },
        { id: 6, name: 'Healthcare', icon: '🏥', color: '#ec4898' },
        { id: 7, name: 'Education', icon: '📚', color: '#06b6d4' },
        { id: 8, name: 'Other', icon: '📝', color: '#6b7280' }
      ]);
    }
  };

  const fetchBudget = async () => {
    try {
      const response = await axios.get('/api/budget');
      setBudget(response.data);
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  };

  const updateBudget = async (budgetData) => {
    try {
      const response = await axios.post('/api/budget', budgetData);
      setBudget(response.data);
      toast.success('Budget updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update budget');
      throw error;
    }
  };

  const getFilteredExpenses = () => {
    let filtered = [...expenses];
    
    if (filters.startDate) {
      filtered = filtered.filter(exp => new Date(exp.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(exp => new Date(exp.date) <= new Date(filters.endDate));
    }
    if (filters.category) {
      filtered = filtered.filter(exp => exp.category === filters.category);
    }
    if (filters.minAmount) {
      filtered = filtered.filter(exp => exp.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(exp => exp.amount <= parseFloat(filters.maxAmount));
    }
    
    return filtered;
  };

  const getTotalExpenses = (expenseList = expenses) => {
    return expenseList.reduce((total, exp) => total + parseFloat(exp.amount), 0);
  };

  const getExpensesByCategory = () => {
    const categoryMap = {};
    expenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0;
      }
      categoryMap[expense.category] += parseFloat(expense.amount);
    });
    return categoryMap;
  };

  const getMonthlyExpenses = () => {
    const monthlyMap = {};
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthlyMap[month]) {
        monthlyMap[month] = 0;
      }
      monthlyMap[month] += parseFloat(expense.amount);
    });
    return monthlyMap;
  };

  const value = {
    expenses,
    categories,
    budget,
    loading,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    updateBudget,
    getFilteredExpenses,
    getTotalExpenses,
    getExpensesByCategory,
    getMonthlyExpenses
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};