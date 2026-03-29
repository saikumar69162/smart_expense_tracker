const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { Op } = require('sequelize');

const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color']
      }],
      order: [['date', 'ASC']]
    });
    
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalTransactions = expenses.length;
    const averagePerDay = totalSpent / new Date(year, month, 0).getDate();
    
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      const categoryName = exp.Category.name;
      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = {
          amount: 0,
          count: 0,
          icon: exp.Category.icon,
          color: exp.Category.color
        };
      }
      categoryBreakdown[categoryName].amount += parseFloat(exp.amount);
      categoryBreakdown[categoryName].count++;
    });
    
    const dailyBreakdown = {};
    for (let day = 1; day <= new Date(year, month, 0).getDate(); day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dailyBreakdown[dateStr] = {
        date: dateStr,
        amount: 0,
        count: 0
      };
    }
    
    expenses.forEach(exp => {
      const dateStr = exp.date;
      dailyBreakdown[dateStr].amount += parseFloat(exp.amount);
      dailyBreakdown[dateStr].count++;
    });
    
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
    
    res.json({
      success: true,
      report: {
        summary: {
          totalSpent,
          totalTransactions,
          averagePerDay,
          daysWithSpending: Object.values(dailyBreakdown).filter(d => d.amount > 0).length
        },
        categoryBreakdown,
        dailyBreakdown: Object.values(dailyBreakdown),
        topExpenses
      }
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.params;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Category,
        attributes: ['name']
      }]
    });
    
    const monthlyBreakdown = {};
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
      monthlyBreakdown[monthName] = {
        month: month,
        amount: 0,
        count: 0
      };
    }
    
    expenses.forEach(exp => {
      const month = new Date(exp.date).getMonth();
      const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
      monthlyBreakdown[monthName].amount += parseFloat(exp.amount);
      monthlyBreakdown[monthName].count++;
    });
    
    const totalYearly = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const averageMonthly = totalYearly / 12;
    
    res.json({
      success: true,
      report: {
        year,
        totalYearly,
        averageMonthly,
        totalTransactions: expenses.length,
        monthlyBreakdown: Object.values(monthlyBreakdown)
      }
    });
  } catch (error) {
    console.error('Get yearly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getCustomReport = async (req, res) => {
  try {
    const { startDate, endDate, categoryId } = req.query;
    
    const whereClause = {
      userId: req.user.id,
      date: {
        [Op.between]: [startDate, endDate]
      }
    };
    
    if (categoryId) whereClause.categoryId = categoryId;
    
    const expenses = await Expense.findAll({
      where: whereClause,
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color']
      }],
      order: [['date', 'ASC']]
    });
    
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalTransactions = expenses.length;
    
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      const categoryName = exp.Category.name;
      if (!categoryBreakdown[categoryName]) {
        categoryBreakdown[categoryName] = {
          amount: 0,
          count: 0,
          icon: exp.Category.icon
        };
      }
      categoryBreakdown[categoryName].amount += parseFloat(exp.amount);
      categoryBreakdown[categoryName].count++;
    });
    
    res.json({
      success: true,
      report: {
        startDate,
        endDate,
        summary: {
          totalSpent,
          totalTransactions,
          averagePerTransaction: totalSpent / totalTransactions || 0
        },
        categoryBreakdown,
        expenses
      }
    });
  } catch (error) {
    console.error('Get custom report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMonthlyReport,
  getYearlyReport,
  getCustomReport
};