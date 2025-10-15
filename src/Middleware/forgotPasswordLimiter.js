// src/Middleware/forgotPasswordLimiter.js

import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ==========================
// Forgot Password Rate Limiter
// ==========================
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5, // maximum 5 password reset requests per IP + email per window

  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable legacy `X-RateLimit-*` headers

  // IPv6-safe key generator
  keyGenerator: (req, res) => {
    const ip = ipKeyGenerator(req); // ✅ IPv6-safe
    const email = req.body?.email || "no-email";
    return `${ip}-${email}`;
  },

  // Custom response when limit is exceeded
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message:
        "Too many password reset attempts from this IP. Please try again later.",
      retryAfter: options.windowMs / 1000, // in seconds
    });
  },
});
