import cron from 'node-cron';
import { Lead } from '../models/Lead.js';
import { REMINDER_EMAIL_TEMPLATE } from '../constants/emailTemplates.js';
import { sendEmail } from '../utils/sendEmail.js';

export const startReminderWorker = () => {
    // Run every hour to check for leads that hit the 24-hour mark
    cron.schedule('0 * * * *', async () => {
        console.log('[Worker] Running hourly reminder check...');
        try {
            // Find leads older than 24 hours
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const leadsToRemind = await Lead.find({
                tag: 'Downloaded Guide',
                booked: false,
                reminderSent: false,
                createdAt: { $lt: twentyFourHoursAgo }
            });

            console.log(`[Worker] Found ${leadsToRemind.length} leads hitting the 24h mark.`);

            for (const lead of leadsToRemind) {
                try {
                    console.log(`[Worker] Sending 24h reminder email via Nodemailer to: ${lead.email}`);

                    await sendEmail(
                        lead.email,
                        'Quick question about your automation guide...',
                        REMINDER_EMAIL_TEMPLATE(lead)
                    );

                    // Update lead to mark reminder as sent
                    lead.reminderSent = true;
                    await lead.save();
                } catch (emailError) {
                    console.log(`[Worker] Skipped updating db for ${lead.email} due to send error.`);
                }
            }

        } catch (error) {
            console.error('[Worker] Error running reminder check:', error);
        }
    });

    console.log('[Worker] Resend Reminder cron job initialized (runs hourly).');
};
