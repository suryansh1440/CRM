import express from 'express';
import { Lead } from '../models/Lead.js';

const router = express.Router();

// @desc    Handle Calendly webhook for invitee.created
// @route   POST /api/webhooks/calendly
// @access  Public
router.post('/calendly', async (req, res) => {
    try {
        const event = req.body;
        console.log(event);

        // Check if the event is a new booking
        if (event.event === "invitee.created") {
            const invitee = event.payload;
            const email = invitee.email;
            const name = invitee.name;

            // Calendly might nest timing in event payload depending on setup, handled defensively:
            const startTime = invitee.tracking?.start_time || invitee.start_time || new Date();
            const endTime = invitee.tracking?.end_time || invitee.end_time || new Date(Date.now() + 30 * 60000);

            // Update lead in CRM
            await Lead.findOneAndUpdate(
                { email },
                {
                    booked: true,
                    tag: "Booked Demo",
                    bookingStartTime: startTime,
                    bookingEndTime: endTime
                }
            );
        }

        res.status(200).send("Webhook received");
    } catch (error) {
        console.error("Calendly Webhook Error:", error);
        res.status(500).send("Error processing webhook");
    }
});

export default router;
