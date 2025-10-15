
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { generateTokenAndSetCookies } from "../util/generateTokenAndSetCookies.js";
import { sendVerificationEmail } from "../email/emails.js";
import { sendWelcomeEmail } from "../email/emails.js"; 
import { sendPasswordResetEmail } from "../email/emails.js"; 
import { sendResetSuccessEmail } from "../email/emails.js"; 
import crypto from "crypto";
 
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if(role === "admin"){
      // 1. Input validation
      if (!username || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Username, and password are required.",
        });
      }

       // 2. Check for existing user
      const existingUser = await User.findOne({
         username 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A admin with that username already exists.",
        });
      }

    }
    else{

      // 1. Input validation
      if (!username || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Username, email, and password are required.",
        });
      }

      // 2. Check for existing user
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user with that email or username already exists.",
        });
      }

    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate verification token (6-digit code, expires in 24h)
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    let user;
    let emailSent;

    if(role === "admin"){
        // 5. Create new user
        user = new User({
          username,
          email,
          password: hashedPassword,
          isVerified: false,
          role,
        });
  
        await user.save();
    }
    else if(role === "superAdmin"){
      // 5. Create new user
      user = new User({
        username,
        email,
        role,
        password: hashedPassword,
      });

      await user.save();
    }
    else{
      // 5. Create new user
      user = new User({
        username,
        email,
        role,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpiresAt,
      });

      await user.save();

        // 6. Attempt to send verification email
        emailSent = true;
        try {
          await sendVerificationEmail(email, verificationToken);
        } catch (error) {
          console.error("❌ Email send failed:", error.message);
          emailSent = false;
        }
      }

    // 7. Prepare user data to return (without password)
    const { password: _, verificationToken: __, ...safeUser } = user.toObject();

    // 8. Respond
    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Registration successful. Verification email sent."
        : "Registration successful, but failed to send verification email.",
      user: safeUser,
      emailSent,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed due to server error.",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Find user by username or email
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT and set cookie
    const token = generateTokenAndSetCookies(res, user._id);

    user.sessionToken = token

    // Update last login
    user.lastLogin = new Date();

    await user.save();

    // Return user info without sensitive fields
    const {
      password: _,
      verificationToken,
      verificationTokenExpiresAt,
      ...safeUser
    } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    // Generate auth token cookie here after verification
    const token=generateTokenAndSetCookies(res, user._id);
    user.sessionToken = token

    await user.save();

    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (emailErr) {
      console.error("Warning: Failed to send welcome email:", emailErr);
      // You can also log this to your error tracking service or database if desired
    }

    const { password, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You are now logged in.",
      user: userData,
    });
  } catch (err) {
    console.error("Error in verifyEmail:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: err.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Respond success anyway to avoid revealing user existence
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset email has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/user/Reset-Password/${resetToken}`
    );

    
    res
      .status(200)
      .json({ success: true, message: "Password reset email sent." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: err.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    // Send confirmation email, but don't block response on failure
    try {
      await sendResetSuccessEmail(user.email);
    } catch (emailError) {
      console.error("Failed to send reset success email:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: err.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {

    const user=await User.findById(req.user).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No user found in request.",
      });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Please verify your email to continue.",
      });
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.error("Error in checkAuth:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Track whether anything has been updated
    let isUpdated = false;

    // Handle username update
    if (username && username !== user.username) {
      // Optionally check for duplicates:
      const usernameExists = await User.findOne({ username });
      if (
        usernameExists &&
        usernameExists._id.toString() !== userId.toString()
      ) {
        return res.status(400).json({ message: "Username already in use" });
      }

      user.username = username;
      isUpdated = true;
    }

    // Handle password update
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({
            message: "Current password is required to set a new password",
          });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      isUpdated = true;
    }

    if (!isUpdated) {
      return res.status(400).json({ message: "No changes detected" });
    }

    await user.save();
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified." });
    }

    const now = new Date();
    // If token exists and not expired, resend same token, else generate new token
    if (
      !user.verificationToken ||
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt < now
    ) {
      user.verificationToken = Math.floor(100000 + Math.random() * 900000);
      user.verificationTokenExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
      await user.save();
    }

    try {
      await sendVerificationEmail(user.email, user.verificationToken);
      res
        .status(200)
        .json({ success: true, message: "Verification email resent." });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email.",

      });
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    // Delete user
    await user.deleteOne();

    // Clear auth token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllUser = async (req, res) => {
  try {
    // Fetch all users from the database and exclude the password field for security
    const users = await User.find().select('-password');

    // Check if no users are found
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    // Count total users
    const totalUsers = users.length;

    // Count how many users are verified
    const verifiedUsersCount = users.filter(user => user.isVerified).length;

    // Send response with total users, verified users, and the list of users
    res.status(200).json({
      success: true,
      totalUsers,
      verifiedUsersCount,
      users,
    });

  } catch (error) {
    // Handle server errors
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}; 

export const getAllAdmin = async (req, res) => {
  try {
    // Fetch all users from the database excluding the password field
    const users = await User.find().select('-password');

    // If no users are found, return a 400 response
    if (!users) {
      return res.status(400).json({
        success: false,
        message: "Users not found"
      });
    }

    // Filter only the users with the role "admin"
    const adminLog = users.filter((u) => u.role === "admin");

    // Return the list of admins
    res.status(200).json(adminLog);

  } catch (error) {
    // Log and handle any server errors
    console.log("Error in fetching admins:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Function to update user verification status
export const IsVerified = async (req, res) => {
  const { username, isVerified } = req.body;

  try {
    // Validate input: username must exist and isVerified must be boolean
    if (!username || typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Username and a valid boolean value for isVerified are required",
      });
    }

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update verification status
    user.isVerified = isVerified;
    await user.save();

    // Return success response without password field
    res.status(200).json({
      success: true,
      message: `User verification status updated to ${isVerified}`,
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    // Handle errors
    console.error("Error updating verification status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Function to reset user password
export const ResetPassword = async (req, res) => {
  try {
    const { userName, newPassword } = req.body;

    // Validate required fields
    if (!userName || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user by username
    const user = await User.findOne({ username: userName });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user fields
    user.username = userName;
    user.password = hashedNewPassword;

    await user.save();

    // Send success response without password field
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    // Handle errors
    console.error("Error in ResetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Function to delete an admin by username
export const deleteAdmin = async (req, res) => {
  const { userName } = req.body;

  try {
    // Find and delete admin by username
    const admin = await User.findOneAndDelete({ username: userName });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Admin not found or not deleted",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    // Handle errors
    console.log("Error in deleting admin:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
