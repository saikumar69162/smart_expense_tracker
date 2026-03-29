const { sequelize } = require('./database');
const User = require('../models/User');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Create default user
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'Demo123456'
    });
    
    // Create default categories
    const categories = await Category.bulkCreate([
      { userId: user.id, name: 'Groceries', icon: '🛒', color: '#10b981' },
      { userId: user.id, name: 'Restaurants', icon: '🍕', color: '#ef4444' },
      { userId: user.id, name: 'Coffee', icon: '☕', color: '#8b5cf6' },
      { userId: user.id, name: 'Gas', icon: '⛽', color: '#3b82f6' },
      { userId: user.id, name: 'Movies', icon: '🎬', color: '#f59e0b' }
    ]);
    
    // Create sample expenses
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      await Expense.create({
        userId: user.id,
        categoryId: categories[Math.floor(Math.random() * categories.length)].id,
        amount: Math.random() * 100 + 10,
        description: `Sample expense ${i + 1}`,
        date: date.toISOString().split('T')[0]
      });
    }
    
    // Create budget
    await Budget.create({
      userId: user.id,
      amount: 2000,
      period: 'monthly',
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      isActive: true
    });
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();