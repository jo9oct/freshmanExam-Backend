
import { mailtrapClient,sender } from "../config/mailtrap.config.js";
import { ReceivedEmailFromUser } from "./emailTemplates.js";

// Function to send emails received from users to your Mailtrap inbox
export const ReceivedEmail = async (email, name, subject, message) => {
    const recipients = [{ email }]; // Recipient array required by Mailtrap
  
    try {
      const response = await mailtrapClient.send({
        from: sender, // Sender info defined in Mailtrap setup
        to: recipients, // Recipient(s)
        subject: subject, // Subject of the email
        // Replace placeholders in the HTML template with actual user-provided message and name
        html: ReceivedEmailFromUser.replace("{message}", message).replace("{name}", name),
        category: "Email Notification", // Category for easier filtering in Mailtrap
      });
  
      console.log("✅ Email sent successfully:", response); // Log success
    } catch (error) {
      console.error("❌ Error receiving email:", error); // Log error if sending fails
      throw new Error("Failed to receive email"); // Throw error to handle upstream
    }
  };
  

