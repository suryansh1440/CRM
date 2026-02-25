import express from 'express';
import { createLead, markLeadAsBooked, getLeads, getStats, getLeadById } from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createLead);
router.get('/', protect, getLeads);
router.get('/stats', protect, getStats);
router.get('/:id', getLeadById);
router.put('/:id/book', markLeadAsBooked);

// Render Wakeup Endpoint
router.get('/wakeup/cron', (req, res) => {
    res.status(200).json({ message: "Server is awake!" });
});

export default router;
