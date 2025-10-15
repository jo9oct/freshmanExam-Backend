
import { PASSWORD_RESET_REQUEST_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient } from "../config/mailtrap.config.js";
import { sender } from "../config/mailtrap.config.js";

// ---------------- Send verification email with token ----------------
export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }]; // Recipient array required by Mailtrap

  try {
    const response = await mailtrapClient.send({
      from: sender, // Sender info defined in your mailtrap setup
      to: recipient,
      subject: "FreshmanExams Verification Code",
      text: `Your verification code is: ${verificationToken}`, // Fallback text
      html: `...`, // Full HTML email template with embedded verificationToken
      category: "Email Verification", // Category label in Mailtrap
    });

    console.log(`✅ Verification email sent to ${email}`);
    return response;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw new Error("Failed to send verification email.");
  }
};

// ---------------- Send welcome email using a Mailtrap template ----------------
export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "f760727b-cfea-4495-86e6-dae6725435ef", // Mailtrap template ID
      template_variables: {
        company_info_name: "FreshmanEXAMS",
        name: name, // Dynamic variable replacement in template
      },
    });
  } catch (error) {
    console.error("❌ Error sending welcome Email. :", error);
    throw new Error("Failed to send welcome email.");
  }
};

// ---------------- Send password reset email with reset link ----------------
export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE
        .replace("{{user_email}}", email)
        .replace("{{pass_reset_link}}", resetURL),
      category: "Password Reset",
    });
  } catch (error) {
    console.error("❌ Error sending reset password Email. :", error);
    throw new Error("Failed to send reset password email.");
  }
};

// ---------------- Send password reset success confirmation email ----------------
export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: `...`, // Full HTML template confirming successful password reset
      category: "Password Reset Success",
    });
  } catch (error) {
    console.error("❌ Error sending password reset success Email. :", error);
    throw new Error("Failed to send password reset success email.");
  }
};
