import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ExpenseChart from './ExpenseChart';
import BudgetProgress from './BudgetProgress';
import RecentTransactions from './RecentTransactions';
import { FiTrendingUp, FiTrendingDown, FiCalendar } from 'react-icons/fi';

const Dashboard = () => {
  const { expenses, getTotalExpenses, getExpensesByCategory, budget, loading } = useExpenses();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    averageDaily: 0,
    monthlyChange: 0,
    remainingBudget: 0
  });

  useEffect(() => {
    const total = getTotalExpenses();
    const currentMonthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });
    const currentMonthTotal = getTotalExpenses(currentMonthExpenses);
    
    const lastMonthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return expDate.getMonth() === lastMonth.getMonth() && expDate.getFullYear() === lastMonth.getFullYear();
    });
    const lastMonthTotal = getTotalExpenses(lastMonthExpenses);
    
    const monthlyChange = lastMonthTotal === 0 ? 0 : ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const averageDaily = currentMonthTotal / daysInMonth;
    
    const remainingBudget = budget?.monthlyBudget ? budget.monthlyBudget - currentMonthTotal : 0;
    
    setStats({
      totalExpenses: total,
      averageDaily,
      monthlyChange,
      remainingBudget
    });
  }, [expenses, budget, getTotalExpenses]);

  const statCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses),
      icon: <span className="text-blue-500 text-xl font-bold leading-none">£</span>,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Average Daily',
      value: formatCurrency(stats.averageDaily),
      icon: <FiCalendar className="text-green-500" size={24} />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Monthly Change',
      value: `${stats.monthlyChange >= 0 ? '+' : ''}${stats.monthlyChange.toFixed(1)}%`,
      icon: stats.monthlyChange >= 0 ? <FiTrendingUp className="text-red-500" size={24} /> : <FiTrendingDown className="text-green-500" size={24} />,
      bgColor: stats.monthlyChange >= 0 ? 'bg-red-50' : 'bg-green-50',
      textColor: stats.monthlyChange >= 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Remaining Budget',
      value: formatCurrency(stats.remainingBudget),
      icon: <span className="text-purple-500 text-xl font-bold leading-none">£</span>,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-blue-100">
          Here's your financial overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                {card.icon}
              </div>
              <span className={`text-sm font-semibold ${card.textColor}`}>
                {card.title === 'Monthly Change' && (stats.monthlyChange >= 0 ? 'vs last month' : 'vs last month')}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            <p className="text-gray-500 text-sm mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
          <ExpenseChart />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Progress</h2>
          <BudgetProgress />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <RecentTransactions />
      </div>
    </div>
  );
};

export default Dashboard;
