import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();
// Mailtrap API token (replace with your own or use env variable for security)
export const TOKEN = "fcf8c844e446fa10b18599b1ab6dd6e2";

// Initialize Mailtrap client with API token
export const mailtrapClient = new MailtrapClient({ token: TOKEN });

// Define the sender information for emails
export const sender = {
  email: "hello@demomailtrap.co", // sender email address
  name: "Mailtrap Test",          // sender name
};