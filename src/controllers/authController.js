const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const emailLogger = require('../utils/emailLogger');
const { generateCsrfToken } = require("../middleware/csrfProtection");

exports.register = async (req, res) => {
    const { name, email, phone, degree, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        console.log('Passwords do not match!')
        return res.status(400).send("<script>alert('Passwords do not match!'); window.location.href='/register';</script>");
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists!')
            return res.status(400).send("<script>alert('User already exists!'); window.location.href='/register';</script>");
        }

        // Generate a random activation code
        const rac = crypto.randomBytes(3).toString('hex').toUpperCase();

        user = new User({ name, email, phone, degree, rac, password });
        await user.save();

        // Send the activation code via email
        emailLogger(`
        To: ${email}
        Subject: Verify Your Email
        Message: 
        Hello, 
        Your activation code is: ${rac}.
        `);

        res.send("<script>alert('Registration successful! Check your email for verification.'); window.location.href='/verify';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server error! Try again.'); window.location.href='/register';</script>");
    }
};

exports.verifyAccount = async (req, res) => {
    const { email, activationCode } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found!')
            return res.status(400).send("<script>alert('User not found!'); window.location.href='/verify';</script>");
        }

        if (user.isVerified) {
            console.log('Account already verified!')
            return res.status(400).send("<script>alert('Account already verified!'); window.location.href='/login';</script>");
        }

        if (user.rac !== activationCode) {
            console.log('Invalid activation code!')
            return res.status(400).send("<script>alert('Invalid activation code!'); window.location.href='/verify';</script>");
        }

        // Update the user as verified
        user.isVerified = true;
        user.rac = undefined; // Remove the activation code after successful verification
        await user.save();
        console.log('Account verified successfully! You can now login.')
        res.send(
            "<script>alert('Account verified successfully! You can now login.'); window.location.href='/login';</script>"
        );
    } catch (error) {
        res.status(500).send("<script>alert('Server error! Try again.'); window.location.href='/verify';</script>");
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
            return res.status(400).send("<script>alert('Invalid password.'); window.location.href='/login';</script>");

        if (!user.isVerified) 
            return res.status(400).send("<script>alert('Email not verified.'); window.location.href='/login';</script>");

        const token = jwt.sign(
            { userId: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour
        if(user.role === 'admin'){
            res.redirect("/api/department-head");
        }
        else{
            res.redirect("/student-dashboard");
        }
        
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

exports.headRegister = async (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        console.log('Passwords do not match!')
        return res.status(400).send("<script>alert('Passwords do not match!'); window.location.href='/department-head-register';</script>");
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists!')
            return res.status(400).send("<script>alert('User already exists!'); window.location.href='/department-head-register';</script>");
        }
        
        const role = 'admin';
        const isVerified = true;
        user = new User({ name, email, role, isVerified, password });
        await user.save();
        
        console.log('Registration successful')
        res.send("<script>alert('Registration successful.'); window.location.href='/login';</script>");
    } catch (error) {
        res.status(500).send("<script>alert('Server error! Try again.'); window.location.href='/department-head-register';</script>");
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token"); // Remove the authentication token
    res.redirect("/login"); // Redirect the user to the login page
};
