const express = require('express');
const controller = require('../controllers/feedbackController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/analyze', asyncHandler(controller.analyze));
router.get('/', asyncHandler(controller.list));
router.post('/reset', asyncHandler(controller.reset));
router.get('/rules', asyncHandler(controller.rules));

module.exports = router;
