
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Middleware to check if the user is authenticated
export const isAuthenticated = async (req, res, next) => {
  try {
    let token;

    // Extract token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token is provided, deny access
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - no token provided",
      });
    }

    // Verify JWT token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user in the database, excluding the password field
    const user = await User.findById(decoded.userId).select("-password");

    // If user not found, deny access
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Check if the token matches the user's current session token
    if (user.sessionToken !== token) {
      // Clear the cookie if the user logged in from another device
      res.clearCookie("token");
      return res
        .status(404)
        .json({ success: false, message: "User logged in on another device" });
    }

    // Attach user object to request for downstream routes
    req.user = user;

    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
