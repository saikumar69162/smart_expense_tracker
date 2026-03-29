export const CATEGORIES = [
  { id: 1, name: 'Food', icon: '🍔', color: '#ef4444' },
  { id: 2, name: 'Transportation', icon: '🚗', color: '#3b82f6' },
  { id: 3, name: 'Shopping', icon: '🛍️', color: '#10b981' },
  { id: 4, name: 'Entertainment', icon: '🎬', color: '#f59e0b' },
  { id: 5, name: 'Utilities', icon: '💡', color: '#8b5cf6' },
  { id: 6, name: 'Healthcare', icon: '🏥', color: '#ec4898' },
  { id: 7, name: 'Education', icon: '📚', color: '#06b6d4' },
  { id: 8, name: 'Other', icon: '📝', color: '#6b7280' }
];

export const EXPENSE_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

export const BUDGET_PERIODS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  EXPENSES: '/api/expenses',
  CATEGORIES: '/api/categories',
  BUDGET: '/api/budget',
  REPORTS: '/api/reports'
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SETTINGS: 'settings'
};

export const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4898',
  '#06b6d4',
  '#6b7280'
];