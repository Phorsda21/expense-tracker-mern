const router = require('express').Router();
const { addCurrency, getCurrencies, deleteCurrency, updateCurrency } = require('../controllers/currencyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addCurrency);
router.get('/', protect, getCurrencies);
router.delete('/:id', protect, deleteCurrency);
router.put('/:id', protect, updateCurrency);

module.exports = router;
