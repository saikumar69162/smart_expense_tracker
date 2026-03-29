import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import { FiSave, FiDollarSign, FiAlertCircle } from 'react-icons/fi';

const BudgetSetup = () => {
  const { budget, updateBudget, categories, expenses } = useExpenses();
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (budget) {
      setMonthlyBudget(budget.monthlyBudget?.toString() || '');
      setCategoryBudgets(budget.categoryBudgets || {});
    }
  }, [budget]);
  
  const currentMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  
  const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const remaining = monthlyBudget ? parseFloat(monthlyBudget) - totalSpent : 0;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBudget({
        monthlyBudget: parseFloat(monthlyBudget),
        categoryBudgets: categoryBudgets
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCategoryBudgetChange = (categoryId, value) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [categoryId]: parseFloat(value) || 0
    }));
  };
  
  const getCategorySpent = (categoryName) => {
    return currentMonthExpenses
      .filter(exp => exp.category === categoryName)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget Settings</h1>
          <p className="text-gray-500 mt-1">Set your monthly spending limits</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monthly Budget Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FiDollarSign className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Monthly Budget</h2>
          </div>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Monthly Spending Limit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                step="100"
                min="0"
                className="input-field pl-8"
                placeholder="0.00"
              />
            </div>
            
            {monthlyBudget && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Spent this month</span>
                  <span className="font-semibold">{formatCurrency(totalSpent)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(remaining)}
                  </span>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      remaining < 0 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((totalSpent / monthlyBudget) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Category Budgets */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <FiAlertCircle className="text-purple-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Category Budgets (Optional)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => {
              const spent = getCategorySpent(category.name);
              const budgetAmount = categoryBudgets[category.id] || 0;
              const remaining = budgetAmount - spent;
              
              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{category.icon}</span>
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Spent: {formatCurrency(spent)}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      value={budgetAmount || ''}
                      onChange={(e) => handleCategoryBudgetChange(category.id, e.target.value)}
                      className="input-field pl-7"
                      placeholder="Budget limit"
                      step="10"
                      min="0"
                    />
                  </div>
                  
                  {budgetAmount > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Remaining</span>
                        <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            remaining < 0 ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((spent / budgetAmount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave size={18} />
                <span>Save Budget Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetSetup;