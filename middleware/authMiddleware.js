const jwt = require("jsonwebtoken");


// ==========================================
// VERIFY LOGIN TOKEN
// ==========================================

function authMiddleware(req, res, next) {

    try {

        // Get Authorization header
        const authHeader =
            req.headers.authorization;


        // Check token exists
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                message: "Access denied. Please login."
            });

        }


        // Extract token
        const token =
            authHeader.split(" ")[1];


        // Verify token
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Store user information in request
        req.user = decoded;


        // Continue
        next();


    } catch (error) {

        console.error(
            "Authentication Error:",
            error.message
        );


        return res.status(401).json({
            message: "Invalid or expired token."
        });

    }

}



// ==========================================
// CHECK ADMIN ROLE
// ==========================================

function adminMiddleware(req, res, next) {

    if (
        !req.user ||
        req.user.role !== "admin"
    ) {

        return res.status(403).json({
            message: "Admin access required."
        });

    }


    next();

}



// ==========================================
// EXPORT
// ==========================================

module.exports = {
    authMiddleware,
    adminMiddleware
};