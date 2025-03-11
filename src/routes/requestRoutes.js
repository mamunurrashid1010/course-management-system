const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCsrfToken } = require("../middleware/csrfProtection");
const { createRequest, getStudentRequests, cancelRequest, submitRequest } = require('../controllers/requestController');

const router = express.Router();

// router.post('/', authMiddleware, createRequest); 
router.post("/", authMiddleware, validateCsrfToken, submitRequest); // need to check
router.get('/', authMiddleware, getStudentRequests); 
router.put('/cancel/:requestId', authMiddleware, cancelRequest);

module.exports = router;
