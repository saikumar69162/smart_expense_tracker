import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import { FiTrendingUp, FiTrendingDown, FiTarget } from 'react-icons/fi';

const BudgetOverview = () => {
  const { expenses, budget, categories } = useExpenses();
  
  const currentMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  
  const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const monthlyBudget = budget?.monthlyBudget || 0;
  const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const remaining = monthlyBudget - totalSpent;
  
  const categorySpending = categories.map(category => {
    const spent = currentMonthExpenses
      .filter(exp => exp.category === category.name)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const budgetAmount = budget?.categoryBudgets?.[category.id] || 0;
    
    return {
      ...category,
      spent,
      budget: budgetAmount,
      remaining: budgetAmount - spent,
      percentage: budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0
    };
  }).filter(cat => cat.spent > 0 || cat.budget > 0);
  
  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="space-y-6">
      {/* Overall Budget Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium opacity-90">Monthly Budget Overview</h3>
            <p className="text-3xl font-bold mt-2">{formatCurrency(monthlyBudget)}</p>
          </div>
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <FiTarget size={32} />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Spent: {formatCurrency(totalSpent)}</span>
            <span>Remaining: {formatCurrency(remaining)}</span>
          </div>
          <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>{percentage.toFixed(1)}% used</span>
            <span className={remaining < 0 ? 'text-red-200' : 'text-green-200'}>
              {remaining >= 0 ? 'On Track' : 'Over Budget'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Category Budget Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {categorySpending.map(category => (
            <div key={category.id}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{category.icon}</span>
                  <span className="font-medium text-gray-800">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">
                    {formatCurrency(category.spent)}
                  </span>
                  {category.budget > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      / {formatCurrency(category.budget)}
                    </span>
                  )}
                </div>
              </div>
              
              {category.budget > 0 && (
                <>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getProgressColor(category.percentage)}`}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs font-medium ${getStatusColor(category.percentage)}`}>
                      {category.percentage.toFixed(1)}% used
                    </span>
                    <span className={`text-xs ${category.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {category.remaining >= 0 
                        ? `${formatCurrency(category.remaining)} left`
                        : `${formatCurrency(Math.abs(category.remaining))} over`}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {categorySpending.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No expenses recorded this month
            </div>
          )}
        </div>
      </div>
      
      {/* Tips Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FiTrendingUp className="text-yellow-600" size={20} />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Budget Tips</h3>
            <div className="mt-1 text-sm text-yellow-700">
              {percentage >= 100 ? (
                <p>You've exceeded your monthly budget. Consider reviewing your expenses and adjusting your spending habits.</p>
              ) : percentage >= 80 ? (
                <p>You're close to your budget limit. Be mindful of remaining expenses this month.</p>
              ) : (
                <p>Great job staying within budget! Keep tracking your expenses to maintain financial discipline.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;