import { Resend } from 'resend';
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Send an email using async/await and Resend
export const sendEmail = async (to, subject, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'AutoSync CRM <onboarding@resend.dev>', // Resend trial requires this from address unless domain is verified
            to: typeof to === 'string' ? [to] : to,
            subject,
            html
        });

        if (error) {
            console.error("Error from Resend API:", error);
            return;
        }

        console.log("Message sent via Resend:", data?.id);
    } catch (error) {
        console.error("Error sending email:", error);
        // Do not throw, just log. This prevents crash during dev if creds are wrong.
    }
};
