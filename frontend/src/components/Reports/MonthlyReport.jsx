import React from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line 
} from 'recharts';

const MonthlyReport = ({ month }) => {
  const { expenses } = useExpenses();
  
  const monthExpenses = expenses.filter(exp => exp.date.startsWith(month));
  
  // Daily spending data
  const daysInMonth = new Date(month + '-01').getMonth() + 1;
  const dailyData = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dayExpenses = monthExpenses.filter(exp => exp.date === `${month}-${dayStr}`);
    const total = dayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    dailyData.push({
      day: day,
      amount: total,
      transactionCount: dayExpenses.length
    });
  }
  
  // Category breakdown
  const categoryData = monthExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
    return acc;
  }, {});
  
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));
  
  const totalSpent = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const averageDaily = totalSpent / daysInMonth;
  const totalTransactions = monthExpenses.length;
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Total Spent</p>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Average Daily</p>
          <p className="text-2xl font-bold mt-2">{formatCurrency(averageDaily)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Total Transactions</p>
          <p className="text-2xl font-bold mt-2">{totalTransactions}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90">Days with Spending</p>
          <p className="text-2xl font-bold mt-2">{dailyData.filter(d => d.amount > 0).length}</p>
        </div>
      </div>
      
      {/* Daily Spending Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Spending Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'white', borderRadius: '8px', padding: '8px' }}
            />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Cumulative Spending Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cumulative Spending</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData.reduce((acc, curr, idx) => {
            const cumulative = (acc[idx - 1]?.cumulative || 0) + curr.amount;
            acc.push({ day: curr.day, cumulative });
            return acc;
          }, [])}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Top Spending Days */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Spending Days</h3>
        <div className="space-y-2">
          {dailyData
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((day, index) => (
              <div key={day.day} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-800">Day {day.day}</span>
                  <span className="text-sm text-gray-500 ml-2">({day.transactionCount} transactions)</span>
                </div>
                <span className="font-semibold text-gray-800">{formatCurrency(day.amount)}</span>
              </div>
            ))}
        </div>
      </div>
      
      {/* Insights */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Monthly Insights</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• Highest spending day: Day {dailyData.reduce((max, day) => day.amount > max.amount ? day : max, dailyData[0])?.day}</li>
          <li>• You spent on {dailyData.filter(d => d.amount > 0).length} out of {daysInMonth} days</li>
          <li>• Average of {formatCurrency(averageDaily)} per day</li>
          <li>• {totalTransactions} total transactions this month</li>
        </ul>
      </div>
    </div>
  );
};

export default MonthlyReport;