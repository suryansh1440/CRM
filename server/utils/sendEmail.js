import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

// Send an email using async/await and OneSignal
export const sendEmail = async (to, subject, html) => {
    try {
        const payload = {
            app_id: process.env.ONESIGNAL_APP_ID,
            include_email_tokens: typeof to === 'string' ? [to] : to,
            email_subject: subject,
            email_body: html
        };

        const response = await axios.post('https://onesignal.com/api/v1/notifications', payload, {
            headers: {
                'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.data.errors) {
            console.error("Error from OneSignal API:", response.data.errors);
            return;
        }

        console.log("Message sent via OneSignal:", response.data.id);
    } catch (error) {
        console.error("Error sending email:", error.response ? error.response.data : error.message);
        // Do not throw, just log. This prevents crash during dev if creds are wrong.
    }
};
