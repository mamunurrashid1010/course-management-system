const express = require('express');
const { check } = require('express-validator');
const { register, headRegister, verifyAccount, login, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], register);
router.post('/head-register', headRegister);
router.post("/verify", verifyAccount);
router.post('/login', login);
router.get('/logout',logout);

module.exports = router;
