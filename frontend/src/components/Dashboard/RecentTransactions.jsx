import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';

const RecentTransactions = ({ limit = 5 }) => {
  const { expenses, categories, deleteExpense } = useExpenses();
  
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
  
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.icon || '📝';
  };
  
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6b7280';
  };
  
  if (recentExpenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions yet. Start by adding an expense!
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {recentExpenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
            <div>
              <h4 className="font-medium text-gray-800">{expense.description || expense.category}</h4>
              <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-800">
              {formatCurrency(expense.amount)}
            </span>
            <button
              onClick={() => deleteExpense(expense.id)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;