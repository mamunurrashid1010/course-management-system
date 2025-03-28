require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const exphbs = require("express-handlebars");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const path = require('path');
const authMiddleware = require("./src/middleware/authMiddleware");
const connectDB = require('./src/config/db');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const departmentHeadRoutes = require('./src/routes/departmentHeadRoutes');

// Initialize App
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(bodyParser.json()); // Parse JSON requests
app.use(cookieParser());

// Connect Database
connectDB();

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'client')));
app.use('/css', express.static(path.join(__dirname, 'src','client', 'css')));
app.use('/vendors', express.static(path.join(__dirname, 'src', 'client', 'vendors')));

// Setup Handlebars
app.engine("hbs", exphbs.engine({ extname: "hbs", defaultLayout: false }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, 'src','client'));

// default route
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Serve Login Page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'client', 'login.html'));
});

// Serve Registration Page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'client', 'register.html'));
});
// Serve Verify Page
app.get('/verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'client', 'verify.html'));
});

// student dashboard
app.get('/student-dashboard', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'client', 'studentDashboard.html'));
});

// student add request
app.get('/student-add-request', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'client', 'addRequest.html'));
});

// department head register
app.get('/department-head-register', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'client', 'departmentHeadRegister.html'));
});


app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/department-head', departmentHeadRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});