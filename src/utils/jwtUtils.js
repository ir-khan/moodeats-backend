const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in the token
 * @param {String} expiresIn - Token expiration time (default: "1h")
 * @returns {String} JWT token
 */
const generateToken = (payload, expiresIn = "1h") => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {String} token - The token to verify
 * @returns {Object|null} Decoded token if valid, null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null; // Token is invalid
    }
};

module.exports = { generateToken, verifyToken };
