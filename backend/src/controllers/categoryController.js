const Category = require('../models/Category');
const Expense = require('../models/Expense');
const { Op, fn, col, where } = require('sequelize');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { userId: req.user.id },
          { isDefault: true }
        ],
        type: 'expense'
      },
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, icon, color, parentCategory } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: {
        [Op.and]: [
          where(fn('LOWER', col('name')), name.trim().toLowerCase())
        ],
        userId: req.user.id
      }
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }
    
    const category = await Category.create({
      userId: req.user.id,
      name: name.trim(),
      icon: icon || '📝',
      color: color || '#6b7280',
      parentCategory,
      isDefault: false
    });
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isDefault: false
      }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or cannot be modified'
      });
    }
    
    const { name, icon, color, parentCategory } = req.body;

    if (name) {
      const existingCategory = await Category.findOne({
        where: {
          userId: req.user.id,
          id: { [Op.ne]: req.params.id },
          [Op.and]: [
            where(fn('LOWER', col('name')), name.trim().toLowerCase())
          ]
        }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category already exists'
        });
      }
    }
    
    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (parentCategory !== undefined) category.parentCategory = parentCategory;
    
    await category.save();
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isDefault: false
      }
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or cannot be deleted'
      });
    }
    
    // Check if category has expenses
    const expenseCount = await Expense.count({
      where: { categoryId: category.id }
    });
    
    if (expenseCount > 0) {
      // Move expenses to default 'Other' category
      const defaultCategory = await Category.findOne({
        where: { name: 'Other', isDefault: true }
      });
      
      if (defaultCategory) {
        await Expense.update(
          { categoryId: defaultCategory.id },
          { where: { categoryId: category.id } }
        );
      }
    }
    
    await category.destroy();
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
