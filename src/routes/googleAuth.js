
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";
import { makeUniqueUsername } from "../util/makeUsername.js";
import verifyToken from "../Middleware/verifyToken.js";
import { StatusData } from "../models/UserStatusData.js";

dotenv.config();

const router = express.Router();

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const photo = profile.photos?.[0]?.value;
        const name = profile.displayName;

        if (!email) return done(new Error("Google account has no email"), null);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            user.provider = "google";
            user.photo = user.photo || photo;
            user.isVerified = true;
            user.role = "user";
            await user.save();
          }
        } else {
          // Otherwise, create new user
          const username = await makeUniqueUsername({ name, email });

          user = await User.create({
            googleId: profile.id,
            provider: "google",
            username,
            email,
            photo,
            role: "user",
            isVerified: true,
          });

          // Save StatusData directly
          const statusData = new StatusData({ userName: user.username });
          await statusData.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);


// Start Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/User/Login" }),
  async (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // Save token to user's sessionToken field for single-device login
      req.user.sessionToken = token;
      await req.user.save();

      // Set token as HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend
      const redirectUrl = process.env.CLIENT_SUCCESS_REDIRECT || "http://localhost:5173";
      res.redirect(redirectUrl);
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect("/User/Login"); // fallback
    }
  }
);

// Get logged-in user
router.get("/me", verifyToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  res.json({
    success: true,
    user: req.user,
  });
});


export default router;
