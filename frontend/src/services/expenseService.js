import api from './api';

export const expenseService = {
  // Expense endpoints
  getExpenses: async (params) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },
  
  getExpense: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  
  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },
  
  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },
  
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  
  // Category endpoints
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
  
  // Budget endpoints
  getBudget: async () => {
    const response = await api.get('/budget');
    return response.data;
  },
  
  updateBudget: async (budgetData) => {
    const response = await api.post('/budget', budgetData);
    return response.data;
  },
  
  // Report endpoints
  getReports: async (params) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },
  
  getMonthlySummary: async (year, month) => {
    const response = await api.get(`/reports/monthly/${year}/${month}`);
    return response.data;
  }
};