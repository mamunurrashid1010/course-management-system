const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getQueuesPage, getQueueRequestsPage, resolveRequestPage, getRandomRequestPage } = require('../controllers/departmentHeadController');


const router = express.Router();

router.get('/', authMiddleware, getQueuesPage);
router.get('/queue/:category', authMiddleware, getQueueRequestsPage);
router.get('/request/:requestId', authMiddleware, resolveRequestPage);
router.get('/random', authMiddleware, getRandomRequestPage);
router.post('/resolve/:requestId', authMiddleware, resolveRequestPage);

module.exports = router;
