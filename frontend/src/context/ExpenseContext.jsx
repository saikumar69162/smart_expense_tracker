import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

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
  const { addNotification } = useNotifications();

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
      if ((parseFloat(normalizedExpense.amount) || 0) >= 100) {
        addNotification({
          title: 'Large expense recorded',
          message: `${normalizedExpense.category || 'Expense'} added for ${formatCurrency(normalizedExpense.amount)}.`,
          type: 'warning',
          dedupeKey: `large-expense-${normalizedExpense.id}`
        });
      }
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
      if ((parseFloat(normalizedExpense.amount) || 0) >= 100) {
        addNotification({
          title: 'Large expense updated',
          message: `${normalizedExpense.category || 'Expense'} is now ${formatCurrency(normalizedExpense.amount)}.`,
          type: 'warning',
          dedupeKey: `large-expense-update-${normalizedExpense.id}`
        });
      }
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
      addNotification({
        title: 'Expense deleted',
        message: 'A transaction was removed from your records.',
        type: 'info',
        dedupeKey: `expense-delete-${id}`
      });
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

  const addCategory = async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      setCategories((prev) => [...prev, response.data.category].sort((a, b) => a.name.localeCompare(b.name)));
      addNotification({
        title: 'Category created',
        message: `${response.data.category.name} was added to your categories.`,
        type: 'success',
        dedupeKey: `category-create-${response.data.category.id}`
      });
      toast.success('Category added successfully');
      return response.data.category;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
      throw error;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      setCategories((prev) =>
        prev
          .map((category) => (category.id === id ? response.data.category : category))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      addNotification({
        title: 'Category updated',
        message: `${response.data.category.name} was updated successfully.`,
        type: 'success',
        dedupeKey: `category-update-${response.data.category.id}-${response.data.category.updatedAt || Date.now()}`
      });
      toast.success('Category updated successfully');
      return response.data.category;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update category');
      throw error;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const categoryToDelete = categories.find((category) => category.id === id);
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      addNotification({
        title: 'Category deleted',
        message: `${categoryToDelete?.name || 'A category'} was removed.`,
        type: 'info',
        dedupeKey: `category-delete-${id}`
      });
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
      throw error;
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
      addNotification({
        title: 'Budget saved',
        message: 'Your monthly and category budgets were updated.',
        type: 'success',
        dedupeKey: `budget-save-${year}-${month}-${Date.now()}`
      });
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });

    const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    if (budget?.monthlyBudget > 0) {
      const overallUsage = (currentMonthTotal / budget.monthlyBudget) * 100;

      if (overallUsage >= 100) {
        addNotification({
          title: 'Monthly budget exceeded',
          message: `You have exceeded your monthly budget of ${formatCurrency(budget.monthlyBudget)}.`,
          type: 'error',
          dedupeKey: `overall-budget-exceeded-${monthKey}`
        });
      } else if (overallUsage >= 80) {
        addNotification({
          title: 'Monthly budget alert',
          message: `You have used ${overallUsage.toFixed(1)}% of your monthly budget.`,
          type: 'warning',
          dedupeKey: `overall-budget-alert-${monthKey}`
        });
      }
    }

    Object.entries(budget?.categoryBudgets || {}).forEach(([categoryId, amount]) => {
      const category = categories.find((item) => item.id === categoryId);
      const spent = currentMonthExpenses
        .filter((expense) => expense.categoryId === categoryId || expense.category === category?.name)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      if (amount > 0) {
        const usage = (spent / amount) * 100;

        if (usage >= 100) {
          addNotification({
            title: 'Category budget exceeded',
            message: `${category?.name || 'Category'} is over budget.`,
            type: 'error',
            dedupeKey: `category-budget-exceeded-${categoryId}-${monthKey}`
          });
        } else if (usage >= 80) {
          addNotification({
            title: 'Category budget alert',
            message: `${category?.name || 'Category'} has used ${usage.toFixed(1)}% of its budget.`,
            type: 'warning',
            dedupeKey: `category-budget-alert-${categoryId}-${monthKey}`
          });
        }
      }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const hasRecentExpense = expenses.some((expense) => new Date(expense.date) >= sevenDaysAgo);

    if (!hasRecentExpense) {
      addNotification({
        title: 'Expense reminder',
        message: 'No expenses were recorded in the last 7 days. Update your tracker to keep reports accurate.',
        type: 'info',
        dedupeKey: `expense-reminder-${formatLocalDate(now)}`
      });
    }

    if (currentMonthExpenses.length > 0) {
      const topCategoryMap = currentMonthExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
        return acc;
      }, {});

      const topCategory = Object.keys(topCategoryMap).reduce(
        (best, current) => (topCategoryMap[current] > (topCategoryMap[best] || 0) ? current : best),
        ''
      );

      addNotification({
        title: 'Monthly summary ready',
        message: `${new Date(now.getFullYear(), now.getMonth(), 1).toLocaleString('default', { month: 'long' })}: ${formatCurrency(currentMonthTotal)} spent${topCategory ? `, top category ${topCategory}.` : '.'}`,
        type: 'info',
        dedupeKey: `monthly-summary-${monthKey}`
      });
    }
  }, [expenses, budget, categories, isAuthenticated, addNotification]);

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
    addCategory,
    updateCategory,
    deleteCategory,
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
