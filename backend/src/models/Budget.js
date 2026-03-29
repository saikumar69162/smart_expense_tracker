const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    field: 'user_id'
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true, // null means overall budget
    references: {
      model: 'Categories',
      key: 'id'
    },
    field: 'category_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    field: 'amount'
  },
  period: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
    defaultValue: 'monthly',
    field: 'period'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'year'
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'month'
  },
  alertThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 80, // percentage
    validate: {
      min: 0,
      max: 100
    },
    field: 'alert_threshold'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'budgets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Budget;
