import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import ExpenseForm from './ExpenseForm';
import ExpenseFilters from './ExpenseFilters';
import ExpenseSummary from './ExpenseSummary';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';

const ExpenseList = () => {
  const { expenses, categories, getFilteredExpenses, deleteExpense, loading } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  const filteredExpenses = getFilteredExpenses();
  
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };
  
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.icon || '📝';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-500 mt-1">Track and manage your daily expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={20} />
          <span>Add Expense</span>
        </button>
      </div>
      
      {/* Summary Cards */}
      <ExpenseSummary expenses={filteredExpenses} />
      
      {/* Filters */}
      <ExpenseFilters />
      
      {/* Expense List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No expenses found. Add your first expense!
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                        <span className="text-sm text-gray-800">{expense.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {expense.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ExpenseList;