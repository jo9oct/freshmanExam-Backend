
// Middleware to ensure that the user is logged in and verified
export const requireVerifiedUser = (req, res, next) => {
  // Check if user info is attached to the request (set by isAuthenticated middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in.",
    });
  }

  // Check if the logged-in user is verified
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Please verify your email to access this resource.",
    });
  }

  // If checks pass, allow the request to proceed
  next();
};
