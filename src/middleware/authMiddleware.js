const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // const token = req.header('Authorization');
    const token = req.cookies.token;
    if (!token){
        // return res.status(401).json({ message: 'No token, authorization denied' });
        return res.redirect("/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // res.status(401).json({ message: 'Invalid token' });
        res.clearCookie("token");
        return res.redirect("/login");
    }
};

module.exports = authMiddleware;
