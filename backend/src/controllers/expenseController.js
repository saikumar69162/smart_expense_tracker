const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { Op } = require('sequelize');

const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, categoryId, minAmount, maxAmount, limit = 50, offset = 0 } = req.query;
    
    const whereClause = { userId: req.user.id };
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date[Op.gte] = startDate;
      if (endDate) whereClause.date[Op.lte] = endDate;
    }
    
    if (categoryId) whereClause.categoryId = categoryId;
    
    if (minAmount || maxAmount) {
      whereClause.amount = {};
      if (minAmount) whereClause.amount[Op.gte] = parseFloat(minAmount);
      if (maxAmount) whereClause.amount[Op.lte] = parseFloat(maxAmount);
    }
    
    const expenses = await Expense.findAndCountAll({
      where: whereClause,
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color']
      }],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      total: expenses.count,
      expenses: expenses.rows
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color']
      }]
    });
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    res.json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const createExpense = async (req, res) => {
  try {
    const { amount, categoryId, description, date, paymentMethod, location, tags, notes } = req.body;
    
    // Verify category belongs to user
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
    
    const expense = await Expense.create({
      userId: req.user.id,
      categoryId,
      amount,
      description,
      date: date || new Date(),
      paymentMethod,
      location,
      tags: tags || [],
      notes
    });
    
    const expenseWithCategory = await Expense.findByPk(expense.id, {
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color']
      }]
    });
    
    res.status(201).json({
      success: true,
      expense: expenseWithCategory
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    const { amount, categoryId, description, date, paymentMethod, location, tags, notes } = req.body;
    
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
      
      expense.categoryId = categoryId;
    }
    
    if (amount) expense.amount = amount;
    if (description !== undefined) expense.description = description;
    if (date) expense.date = date;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (location) expense.location = location;
    if (tags) expense.tags = tags;
    if (notes !== undefined) expense.notes = notes;
    
    await expense.save();
    
    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color']
      }]
    });
    
    res.json({
      success: true,
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    await expense.destroy();
    
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getExpenseSummary = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.gte]: startDate
        }
      },
      include: [{
        model: Category,
        attributes: ['name', 'icon', 'color']
      }]
    });
    
    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const average = expenses.length > 0 ? total / expenses.length : 0;
    
    const byCategory = {};
    expenses.forEach(exp => {
      const categoryName = exp.Category.name;
      if (!byCategory[categoryName]) {
        byCategory[categoryName] = 0;
      }
      byCategory[categoryName] += parseFloat(exp.amount);
    });
    
    const dailyData = {};
    expenses.forEach(exp => {
      const date = exp.date;
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += parseFloat(exp.amount);
    });
    
    res.json({
      success: true,
      summary: {
        total,
        average,
        count: expenses.length,
        byCategory,
        daily: dailyData
      }
    });
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
};