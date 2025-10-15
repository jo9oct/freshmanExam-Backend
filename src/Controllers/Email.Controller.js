
import { ReceivedEmail } from "../email/ReceivedEmail.js"


// Controller to handle creating (sending) an email
export const CreateEmail = async (req, res) => {
    // Extract required fields from the request body
    const { email, name, subject, message } = req.body;

    try {
        // ✅ Validate required fields
        if (!email || !name || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // ✅ Call a helper function to process/send the email
        // (Assuming ReceivedEmail is already implemented elsewhere)
        ReceivedEmail(email, name, subject, message);

        // ✅ Respond with success
        res.status(200).json({
            success: true,
            message: "Email sent successfully",
            email
        });

    } catch (error) {
        // ❌ Catch any server or email sending errors
        console.error("Error in CreateEmail:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
