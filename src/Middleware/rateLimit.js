// src/Middleware/authLimiters.js

import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// ==========================
// Login Rate Limiter
// ==========================
export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 50, // maximum 5 login attempts per IP + email per window

  standardHeaders: true,
  legacyHeaders: false,

  // IPv6-safe key generator
  keyGenerator: (req, res) => {
    const ip = ipKeyGenerator(req); // ✅ IPv6-safe
    const email = req.body?.email || req.body?.username || "no-identifier";
    return `${ip}-${email}`;
  },

  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: "Too many login attempts. Please try again after 15 minutes.",
      retryAfter: options.windowMs / 1000,
    });
  },
});

// ==========================
// Register Rate Limiter
// ==========================
export const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 30, // maximum 3 account creations per IP + email per window

  standardHeaders: true,
  legacyHeaders: false,

  // IPv6-safe key generator
  keyGenerator: (req, res) => {
    const ip = ipKeyGenerator(req); // ✅ IPv6-safe
    const email = req.body?.email || "no-email";
    return `${ip}-${email}`;
  },

  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message:
        "Too many accounts created from this IP. Please try again after an hour.",
      retryAfter: options.windowMs / 1000,
    });
  },
});
