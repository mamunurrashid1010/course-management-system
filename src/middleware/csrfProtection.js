const crypto = require("crypto");

const csrfTokens = new Map(); // Store tokens temporarily (in-memory)

const generateCsrfToken = (userId) => {
    const token = crypto.randomBytes(32).toString("hex");
    csrfTokens.set(userId, token);
    return token;
};

const validateCsrfToken = (req, res, next) => {
    const userId = req.user?.userId; // Assuming user is authenticated
    const clientToken = req.headers["x-csrf-token"];

    if (!userId || !clientToken || csrfTokens.get(userId) !== clientToken) {
        return res.status(403).json({ message: "Invalid or missing CSRF token" });
    }

    next();
};

module.exports = { generateCsrfToken, validateCsrfToken };
