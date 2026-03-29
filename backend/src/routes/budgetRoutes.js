const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateBudget } = require('../middleware/validationMiddleware');

router.use(protect);

router.get('/', getBudgets);
router.get('/status', getBudgetStatus);
router.post('/', validate(validateBudget), createBudget);
router.put('/:id', validate(validateBudget), updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;