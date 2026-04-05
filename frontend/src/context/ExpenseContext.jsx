import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ExpenseContext = createContext();

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentBudgetWindow = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    startDate: formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
  };
};

const normalizeBudgetSummary = (budgets = []) => {
  const { year, month } = getCurrentBudgetWindow();
  const monthlyBudgets = budgets.filter(
    (item) => item.period === 'monthly' && item.year === year && item.month === month && item.isActive
  );

  const overallBudget = monthlyBudgets.find((item) => !item.categoryId);
  const categoryBudgets = monthlyBudgets.reduce((acc, item) => {
    if (item.categoryId) {
      acc[item.categoryId] = parseFloat(item.amount) || 0;
    }
    return acc;
  }, {});

  return {
    monthlyBudget: overallBudget ? parseFloat(overallBudget.amount) || 0 : 0,
    categoryBudgets,
    records: budgets
  };
};

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

  const normalizeExpense = (expense) => ({
    ...expense,
    categoryId: expense.categoryId || expense.Category?.id || '',
    category: expense.category || expense.Category?.name || '',
    categoryIcon: expense.categoryIcon || expense.Category?.icon || '',
    categoryColor: expense.categoryColor || expense.Category?.color || ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenses();
      fetchCategories();
      fetchBudget();
    } else {
      setExpenses([]);
      setCategories([]);
      setBudget(null);
    }
  }, [isAuthenticated]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/expenses');
      setExpenses((response.data.expenses || []).map(normalizeExpense));
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await api.post('/expenses', expenseData);
      const normalizedExpense = normalizeExpense(response.data.expense);
      setExpenses(prev => [normalizedExpense, ...prev]);
      toast.success('Expense added successfully');
      return normalizedExpense;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
      throw error;
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      const normalizedExpense = normalizeExpense(response.data.expense);
      setExpenses(prev => prev.map(exp => exp.id === id ? normalizedExpense : exp));
      toast.success('Expense updated successfully');
      return normalizedExpense;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update expense');
      throw error;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || []);
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
      const response = await api.get('/budget');
      setBudget(normalizeBudgetSummary(response.data.budgets || []));
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  };

  const updateBudget = async (budgetData) => {
    try {
      const { year, month, startDate } = getCurrentBudgetWindow();
      const currentRecords = budget?.records || [];
      const monthlyRecords = currentRecords.filter(
        (item) => item.period === 'monthly' && item.year === year && item.month === month
      );

      const overallRecord = monthlyRecords.find((item) => !item.categoryId);
      const requestedCategoryBudgets = budgetData.categoryBudgets || {};
      const existingCategoryRecords = monthlyRecords.filter((item) => item.categoryId);

      const requests = [];
      const monthlyBudgetAmount = Number(budgetData.monthlyBudget) || 0;

      if (monthlyBudgetAmount > 0) {
        const payload = {
          amount: monthlyBudgetAmount,
          period: 'monthly',
          startDate
        };

        if (overallRecord) {
          requests.push(api.put(`/budget/${overallRecord.id}`, payload));
        } else {
          requests.push(api.post('/budget', payload));
        }
      } else if (overallRecord) {
        requests.push(api.delete(`/budget/${overallRecord.id}`));
      }

      existingCategoryRecords.forEach((record) => {
        const amount = Number(requestedCategoryBudgets[record.categoryId]) || 0;
        if (amount > 0) {
          requests.push(api.put(`/budget/${record.id}`, {
            amount,
            period: 'monthly',
            startDate,
            categoryId: record.categoryId
          }));
        } else {
          requests.push(api.delete(`/budget/${record.id}`));
        }
      });

      Object.entries(requestedCategoryBudgets).forEach(([categoryId, value]) => {
        const amount = Number(value) || 0;
        const existingRecord = existingCategoryRecords.find((item) => item.categoryId === categoryId);

        if (!existingRecord && amount > 0) {
          requests.push(api.post('/budget', {
            categoryId,
            amount,
            period: 'monthly',
            startDate
          }));
        }
      });

      await Promise.all(requests);
      await fetchBudget();
      toast.success('Budget updated successfully');
      return true;
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
