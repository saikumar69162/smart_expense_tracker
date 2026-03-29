const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  getYearlyReport,
  getCustomReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/monthly/:year/:month', getMonthlyReport);
router.get('/yearly/:year', getYearlyReport);
router.get('/custom', getCustomReport);

module.exports = router;