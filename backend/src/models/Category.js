const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // null means system default category
    references: {
      model: 'Users',
      key: 'id'
    },
    field: 'user_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name'
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: '📝',
    field: 'icon'
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#6b7280',
    field: 'color'
  },
  type: {
    type: DataTypes.ENUM('expense', 'income'),
    defaultValue: 'expense',
    field: 'type'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_system'
  },
  parentCategory: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'parent_id'
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'budget_limit'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Category;
