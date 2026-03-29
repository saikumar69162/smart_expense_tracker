const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const { Op } = require('sequelize');

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: {
        userId: req.user.id,
        isActive: true
      },
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color'],
        required: false
      }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });
    
    res.json({
      success: true,
      budgets
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const createBudget = async (req, res) => {
  try {
    const { categoryId, amount, period, startDate, year, month, alertThreshold } = req.body;
    
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          [Op.or]: [
            { userId: req.user.id },
            { isDefault: true }
          ]
        }
      });
      
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }
    
    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const budgetYear = year || parsedStartDate.getFullYear();
    const budgetMonth = period === 'yearly' ? null : month || parsedStartDate.getMonth() + 1;

    const budget = await Budget.create({
      userId: req.user.id,
      categoryId: categoryId || null,
      amount,
      period: period || 'monthly',
      year: budgetYear,
      month: budgetMonth,
      alertThreshold: alertThreshold || 80,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    const { amount, period, startDate, year, month, alertThreshold, isActive } = req.body;
    
    if (amount !== undefined) budget.amount = amount;
    if (period) budget.period = period;
    if (year !== undefined) {
      budget.year = year;
    } else if (startDate) {
      budget.year = new Date(startDate).getFullYear();
    }
    if (month !== undefined) {
      budget.month = month;
    } else if (startDate && budget.period !== 'yearly') {
      budget.month = new Date(startDate).getMonth() + 1;
    }
    if (alertThreshold) budget.alertThreshold = alertThreshold;
    if (isActive !== undefined) budget.isActive = isActive;
    
    await budget.save();
    
    res.json({
      success: true,
      budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    await budget.destroy();
    
    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getBudgetStatus = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const budgets = await Budget.findAll({
      where: {
        userId: req.user.id,
        isActive: true,
        [Op.or]: [
          { period: 'yearly', year: currentYear },
          { period: 'quarterly', year: currentYear },
          { period: 'monthly', year: currentYear, month: currentMonth }
        ]
      },
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color'],
        required: false
      }]
    });
    
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [
            new Date(currentYear, currentDate.getMonth(), 1),
            new Date(currentYear, currentDate.getMonth() + 1, 0)
          ]
        }
      }
    });
    
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    const budgetStatus = budgets.map(budget => {
      let spent = 0;
      let percentage = 0;
      
      if (budget.categoryId) {
        spent = expenses
          .filter(exp => exp.categoryId === budget.categoryId)
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      } else {
        spent = totalSpent;
      }
      
      percentage = (spent / budget.amount) * 100;
      
      return {
        ...budget.toJSON(),
        spent,
        remaining: budget.amount - spent,
        percentage,
        isExceeded: spent > budget.amount,
        isAlert: percentage >= budget.alertThreshold
      };
    });
    
    res.json({
      success: true,
      budgets: budgetStatus,
      totalSpent,
      totalBudget: budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0)
    });
  } catch (error) {
    console.error('Get budget status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus
};
