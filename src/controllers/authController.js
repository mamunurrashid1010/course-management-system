const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailLogger = require('../utils/emailLogger');
const { generateCsrfToken } = require("../middleware/csrfProtection");

exports.register = async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).send("<script>alert('Passwords do not match!'); window.location.href='/register';</script>");
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send("<script>alert('User already exists!'); window.location.href='/register';</script>");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ name, email, password: hashedPassword });
        await user.save();

        emailLogger(email, 'Verify Your Email', 'Click the link to verify your account.');

        res.send("<script>alert('Registration successful! Check your email for verification.'); window.location.href='/login';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server error! Try again.'); window.location.href='/register';</script>");
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        // return res.status(400).send("Email and password are required.");
        return res.status(400).send("<script>alert('Email and password are required!'); window.location.href='/login';</script>");
    }

    try {
        const user = await User.findOne({ email });
        if (!user) 
            return res.status(400).send("<script>alert('Invalid credentials.'); window.location.href='/login';</script>");
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) 
            return res.status(400).send("<script>alert('Invalid credentials.'); window.location.href='/login';</script>");

        if (!user.isVerified) 
            return res.status(400).send("<script>alert('Email not verified.'); window.location.href='/login';</script>");

        const token = jwt.sign(
            { userId: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour
        res.redirect("/student-dashboard");
    } catch (error) {
        res.status(500).send("Server error.");
    }
};

// need to check
// exports.login1 = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (!user || !(await user.comparePassword(password))) {
//             return res.status(401).json({ message: "Invalid credentials" });
//         }

//         const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
//         const csrfToken = generateCsrfToken(user._id);

//         res.json({
//             message: "Login successful",
//             token,
//             csrfToken, // Send CSRF token to frontend
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };

exports.logout = (req, res) => {
    res.clearCookie("token"); // Remove the authentication token
    res.redirect("/login"); // Redirect the user to the login page
};
