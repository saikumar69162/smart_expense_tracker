import React, { useState } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import MonthlyReport from './MonthlyReport';
import ExportData from './ExportData';
import { formatCurrency } from '../../utils/formatters';
import { FiBarChart2, FiDownload, FiCalendar } from 'react-icons/fi';

const Reports = () => {
  const { expenses, getExpensesByCategory, getMonthlyExpenses } = useExpenses();
  const [reportType, setReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const expensesByCategory = getExpensesByCategory();
  const monthlyExpenses = getMonthlyExpenses();
  
  const months = [...new Set(expenses.map(exp => exp.date.slice(0, 7)))].sort().reverse();
  
  const getMonthStats = (month) => {
    const monthExpenses = expenses.filter(exp => exp.date.startsWith(month));
    const total = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const average = monthExpenses.length > 0 ? total / monthExpenses.length : 0;
    const topCategory = monthExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});
    const topCategoryName = Object.keys(topCategory).reduce((a, b) => topCategory[a] > topCategory[b] ? a : b, '');
    
    return { total, average, topCategory: topCategoryName, transactionCount: monthExpenses.length };
  };
  
  const currentStats = getMonthStats(selectedMonth);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financial Reports</h1>
          <p className="text-gray-500 mt-1">Analyze your spending patterns</p>
        </div>
        <ExportData expenses={expenses} />
      </div>
      
      {/* Report Type Selector */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setReportType('monthly')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              reportType === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiCalendar size={18} />
            <span>Monthly Report</span>
          </button>
          <button
            onClick={() => setReportType('category')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              reportType === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiBarChart2 size={18} />
            <span>Category Analysis</span>
          </button>
        </div>
      </div>
      
      {/* Month Selector */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input-field max-w-xs"
        >
          {months.map(month => (
            <option key={month} value={month}>
              {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>
      
      {/* Report Content */}
      {reportType === 'monthly' ? (
        <MonthlyReport month={selectedMonth} />
      ) : (
        <div className="space-y-6">
          {/* Category Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500 mb-1">Total Spending</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(currentStats.total)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500 mb-1">Average Transaction</p>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(currentStats.average)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500 mb-1">Top Category</p>
              <p className="text-2xl font-bold text-gray-800">{currentStats.topCategory || 'None'}</p>
            </div>
          </div>
          
          {/* Category Breakdown Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Category Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <tr key={category} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{category}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right">{formatCurrency(amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right">
                        {((amount / currentStats.total) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;