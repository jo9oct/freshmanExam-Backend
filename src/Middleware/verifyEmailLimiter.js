// src/Middleware/verifyEmailLimiter.js

import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Create a rate limiter specifically for the email verification route
export const verifyEmailLimiter = rateLimit({
  // Time window in milliseconds. Here, 60 minutes (60 * 60 * 1000 ms)
  windowMs: 60 * 60 * 1000,

  // Maximum number of requests allowed per IP (or key) within the window
  max: 5,

  // Return rate limit info in the standard RateLimit-* headers
  standardHeaders: true,

  // Disable the deprecated X-RateLimit-* headers
  legacyHeaders: false,

  // Proper IPv6-safe key generator
  keyGenerator: (req, res) => {
    const ip = ipKeyGenerator(req); // ✅ IPv6-safe
    const email = req.body?.email || "no-email";
    return `${ip}-${email}`;
  },

  // Handler function when the rate limit is exceeded
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message:
        "Too many email verification requests. Please try again later.",
      retryAfter: options.windowMs / 1000, // retry time in seconds
    });
  },
});
