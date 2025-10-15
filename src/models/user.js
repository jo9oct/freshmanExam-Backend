// models/User.js
import mongoose from "mongoose";

// User schema for admin, superAdmin, and regular users
const userSchema = new mongoose.Schema(
  {
    // Google OAuth ID (optional for local users)
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows null for local users
    },

    // Authentication provider: local or Google
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // Unique username for the user
    username: {
      type: String,
      unique: true,
      required: true,
    },

    // Unique email for the user
    email: {
      type: String,
      unique: true,
      required: true,
    },

    // Password is required only for local users
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    // Last login timestamp
    lastLogin: {
      type: Date,
      default: Date.now,
    },

    // Flag indicating if the user's email is verified
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Stores the current session token
    sessionToken: {
      type: String,
      default: "",
    },

    // User role: admin, superadmin, or regular user
    role: {
      type: String,
      default: "",
    },

    // Password reset token and expiration
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,

    // Email verification token and expiration
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { 
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true 
  }
);

export default mongoose.model("User", userSchema);
