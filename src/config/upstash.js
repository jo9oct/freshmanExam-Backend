
import dotenv from "dotenv"
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

dotenv.config()

// Import Redis client (assumes you imported it earlier)
const redis = new Redis({
  // URL to your Upstash Redis instance from environment variables
  url: process.env.UPSTASH_REDIS_REST_URL,

  // Token for authentication with Upstash
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Set up a rate limiter using Redis
const rateLimit = new Ratelimit({
  redis, // Redis instance to store counters
  // Sliding window limiter: max 100 requests per 20 seconds
  limiter: Ratelimit.slidingWindow(100, "20 s"),
});


export default rateLimit;