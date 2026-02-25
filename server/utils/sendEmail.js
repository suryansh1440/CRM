import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter using SMTP credentials from environment variables.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_SECURE || true, // Use true for port 465, false for port 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Send an email using async/await
export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: 'suryansh1440@gmail.com', // sender address
            to,  // list of receivers
            subject,  // Subject line
            html // HTML version of the message
        });
        console.log("Message sent:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        // Do not throw, just log. This prevents crash during dev if creds are wrong.
    }
};
