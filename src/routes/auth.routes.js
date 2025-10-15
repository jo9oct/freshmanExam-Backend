import express from "express";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";
import { requireVerifiedUser } from "../Middleware/requireVerifiedUser.js";
import { verifyEmailLimiter } from "../Middleware/verifyEmailLimiter.js";
import {
  logout,
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  checkAuth,
  updateProfile,
  resendVerificationEmail,
  deleteAccount,
  getAllUser,
  getAllAdmin,
  IsVerified,
  ResetPassword,
  deleteAdmin
} from "../Controllers/auth.Controller.js";

import { forgotPasswordLimiter } from "../Middleware/forgotPasswordLimiter.js";
import { resendCodeLimiter } from "../Middleware/resendCodeLImiter.js";
import { registerLimiter, loginLimiter } from "../Middleware/rateLimit.js";
import verifyToken from "../Middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", isAuthenticated, checkAuth);

router.post("/register", registerLimiter, register);
router.post("/verify", verifyEmailLimiter, verifyEmail);
router.post("/login", loginLimiter, login);

router.put(
  "/update-profile",
  isAuthenticated,
  requireVerifiedUser,
  updateProfile
);

router.delete("/delete", verifyToken, deleteAccount);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post(
  "/resend-verification",
  isAuthenticated,
  resendCodeLimiter,
  resendVerificationEmail
);

router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", isAuthenticated, logout);

router.get("/AllUser", getAllUser);

router.get("/AllAdmin", getAllAdmin);

router.post("/IsVerified", IsVerified);

router.post("/ResetAdminPassword", ResetPassword);

router.post("/deleteAdmin", deleteAdmin);

export default router;