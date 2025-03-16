const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCsrfToken } = require("../middleware/csrfProtection");
const { getStudentRequests, cancelRequest, submitRequest } = require('../controllers/requestController');

const router = express.Router();

router.post("/", authMiddleware, submitRequest); // need to check
router.get('/', authMiddleware, getStudentRequests); 
router.post('/cancel/:requestId', authMiddleware, cancelRequest);

module.exports = router;
