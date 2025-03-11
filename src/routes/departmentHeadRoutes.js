const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getRequestQueues, getQueueRequests, resolveRequest, getRandomRequest } = require('../controllers/departmentHeadController');

const router = express.Router();

router.get('/queues', authMiddleware, getRequestQueues);
router.get('/queue/:category', authMiddleware, getQueueRequests);
router.put('/resolve/:requestId', authMiddleware, resolveRequest);
router.get('/random', authMiddleware, getRandomRequest);

module.exports = router;
