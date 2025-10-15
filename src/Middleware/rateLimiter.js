
import rateLimit from "../config/upstash.js";

// Middleware to apply rate limiting per IP
const rateLimiter = async (req, res, next) => {
  try {
    // Check rate limit for the incoming IP
    const { success } = await rateLimit.limit(req.ip);

    // Log the Redis URL (useful for debugging)
    console.log("URL = ", process.env.UPSTASH_REDIS_REST_URL);

    // If the IP has exceeded allowed requests, return 429
    if (!success) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
      });
    }

    // Otherwise, allow the request to continue
    next();
  } catch (error) {
    // Handle any unexpected errors during rate limiting
    console.error("Rate limit error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Export middleware for use in routes
export default rateLimiter;
