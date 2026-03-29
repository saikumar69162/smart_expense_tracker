import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

const BudgetProgress = () => {
  const { expenses, budget } = useExpenses();
  
  const currentMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  
  const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const monthlyBudget = budget?.monthlyBudget || 0;
  const percentage = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getStatusMessage = () => {
    if (percentage >= 100) return 'Budget exceeded! ⚠️';
    if (percentage >= 80) return 'Approaching budget limit! ⚠️';
    if (percentage >= 60) return 'On track, but be mindful 🟡';
    return 'Good progress! ✅';
  };
  
  if (monthlyBudget === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No budget set for this month
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Spent</span>
        <span className="text-sm font-medium text-gray-600">Budget</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-2xl font-bold text-gray-800">{formatCurrency(totalSpent)}</span>
        <span className="text-lg text-gray-600">of {formatCurrency(monthlyBudget)}</span>
      </div>
      
      <div className="relative pt-1">
        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
          <div
            style={{ width: `${Math.min(percentage, 100)}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColor()} transition-all duration-500`}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold">
          {percentage.toFixed(1)}% used
        </span>
        <span className={`text-sm font-medium ${
          percentage >= 100 ? 'text-red-600' : 
          percentage >= 80 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {getStatusMessage()}
        </span>
      </div>
      
      {percentage < 100 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Remaining: {formatCurrency(monthlyBudget - totalSpent)} for the rest of the month
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;