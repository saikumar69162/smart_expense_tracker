const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
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
    allowNull: false,
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
      min: 0.01
    },
    field: 'amount'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'expense_date'
  },
  paymentMethod: {
    type: DataTypes.ENUM(
      'cash',
      'credit_card',
      'debit_card',
      'bank_transfer',
      'mobile_payment',
      'other'
    ),
    defaultValue: 'cash',
    field: 'payment_method'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'location'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'tags'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notes'
  },
  receipt: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'receipt_image'
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_recurring'
  },
  recurringFrequency: {
    type: DataTypes.VIRTUAL,
    allowNull: true
  }
}, {
  tableName: 'expenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['userId', 'date']
    },
    {
      fields: ['userId', 'categoryId']
    }
  ]
});

module.exports = Expense;
