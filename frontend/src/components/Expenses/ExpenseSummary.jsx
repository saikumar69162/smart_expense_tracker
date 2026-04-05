import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { FiTrendingUp, FiTrendingDown, FiPieChart } from 'react-icons/fi';

const ExpenseSummary = ({ expenses }) => {
  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
  const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(exp => parseFloat(exp.amount))) : 0;
  const lowestExpense = expenses.length > 0 ? Math.min(...expenses.map(exp => parseFloat(exp.amount))) : 0;
  
  const summaryCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: <span className="text-blue-500 text-xl font-bold leading-none">£</span>,
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Average Expense',
      value: formatCurrency(averageExpense),
      icon: <FiPieChart className="text-green-500" size={24} />,
      bgColor: 'bg-green-50'
    },
    {
      title: 'Highest Expense',
      value: formatCurrency(highestExpense),
      icon: <FiTrendingUp className="text-red-500" size={24} />,
      bgColor: 'bg-red-50'
    },
    {
      title: 'Lowest Expense',
      value: formatCurrency(lowestExpense),
      icon: <FiTrendingDown className="text-yellow-500" size={24} />,
      bgColor: 'bg-yellow-50'
    }
  ];
  
  if (expenses.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              {card.icon}
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">{card.title}</p>
          <p className="text-xl font-bold text-gray-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ExpenseSummary;
