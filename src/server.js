import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import CourseRoutes from "./routes/Course.route.js";
import ChapterRoutes from "./routes/Chapter.route.js";
import BlogRoutes from "./routes/Blog.route.js";
import QuestionRoutes from "./routes/Question.route.js";
import rateLimiter from "./Middleware/rateLimiter.js";
import AuthRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import EmailRoutes from "./routes/email.route.js"
import View from "./routes/View.route.js"
import StatusData from "./routes/UserStatusData.route.js"
import GoogleAuthRoutes from "./routes/googleAuth.js"; // Google OAuth
import passport from "passport";

dotenv.config();

const app = express();

// Connect to MongoDB
await connectDB(); 

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse JSON request bodies
app.use(express.json());

// Initialize Passport for Google OAuth
app.use(passport.initialize());

// Enable CORS for frontend at localhost:5173 and allow credentials (cookies)

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Set server port
const PORT = process.env.PORT || 5000;

// Routes
app.use("/api/auth", AuthRoutes);          // Authentication routes (login/register)
app.use(rateLimiter);                      // Apply rate limiter globally
app.use("/api/google", GoogleAuthRoutes);  // Google OAuth login
app.use("/api/course", CourseRoutes);      // Courses CRUD routes
app.use("/api/chapter", ChapterRoutes);    // Chapters CRUD routes
app.use("/api/Blog", BlogRoutes);          // Blog CRUD routes
app.use("/api/Question", QuestionRoutes);  // Questions CRUD routes
app.use("/api/email", EmailRoutes);        // Email sending routes
app.use("/api/View", View);                // View tracking routes
app.use("/api/user", StatusData);          // User status/progress routes

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
