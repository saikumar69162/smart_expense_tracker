const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateExpense } = require('../middleware/validationMiddleware');

router.use(protect); // All routes require authentication

router.get('/', getExpenses);
router.get('/summary', getExpenseSummary);
router.get('/:id', getExpense);
router.post('/', validate(validateExpense), createExpense);
router.put('/:id', validate(validateExpense), updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;