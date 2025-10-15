// src/Middleware/resendCodeLimiter.js

import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Create a rate limiter specifically for the "resend verification code" route
export const resendCodeLimiter = rateLimit({
  // Time window in milliseconds. Here, 15 minutes (15 * 60 * 1000 ms)
  windowMs: 15 * 60 * 1000,

  // Maximum number of requests allowed per key (IP + email) within the time window
  max: 5,

  // Use standard RateLimit headers in the response
  standardHeaders: true,

  // Disable the deprecated X-RateLimit-* headers
  legacyHeaders: false,

  // IPv6-safe key generator: combines normalized IP with email
  keyGenerator: (req, res) => {
    const ip = ipKeyGenerator(req); // ✅ IPv6-safe
    const email = req.body?.email || "no-email";
    return `${ip}-${email}`;
  },

  // Custom handler when the rate limit is exceeded
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: "Too many verification code requests. Please try again later.",
      retryAfter: options.windowMs / 1000, // Return retry time in seconds
    });
  },
});
