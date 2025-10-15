import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Middleware to verify JWT token from cookies
const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Extract token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token is provided, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no token provided",
      });
    }

    // Verify JWT using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if decoded payload contains userId
    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Invalid token",
      });
    }

    // Fetch user from database, excluding password
    const user = await User.findById(decoded.userId).select("-password");

    // If user does not exist, deny access
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure the token matches the user's current session token
    if (user.sessionToken !== token) {
      res.clearCookie("token"); // Clear invalid/stale token
      return res.status(404).json({
        success: false,
        message: "User logged in on another device",
      });
    }

    // Attach user info to request for downstream use
    req.user = user;

    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

export default verifyToken;
