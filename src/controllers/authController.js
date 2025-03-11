const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailLogger = require('../utils/emailLogger');
const { generateCsrfToken } = require("../middleware/csrfProtection");

exports.register = async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // const { name, email, password } = req.body;
    console.log(req.body)
    // res.status(200).json({ message: 'Test Registration' });

    // try {
    //     let user = await User.findOne({ email });
    //     if (user) return res.status(400).json({ message: 'User already exists' });

    //     user = new User({ name, email, password });
    //     await user.save();

    //     // Simulate email verification
    //     emailLogger(email, 'Verify Your Email', 'Click the link to verify your account.');

    //     res.status(201).json({ message: 'Registration successful, check email for verification' });
    // } catch (error) {
    //     res.status(500).json({ message: 'Server error' });
    // }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified) return res.status(403).json({ message: 'Email not verified' });

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// need to check
exports.login1 = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const csrfToken = generateCsrfToken(user._id);

        res.json({
            message: "Login successful",
            token,
            csrfToken, // Send CSRF token to frontend
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
