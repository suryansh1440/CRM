import { Lead } from '../models/Lead.js';
import axios from 'axios';
import { sendEmail } from '../utils/sendEmail.js';
import { PDF_DELIVERY_TEMPLATE } from '../constants/emailTemplates.js';

// @desc    Create a new lead (Landing Page submission)
// @route   POST /api/leads
// @access  Public
export const createLead = async (req, res) => {
    try {
        const {
            name, email, phone, businessType, monthlyBudget, readyToAutomate, action,
            utmSource, utmMedium, utmCampaign, utmContent, utmTerm, fbclid, referrer
        } = req.body;

        let tag = 'New Lead';
        if (action === 'download') tag = 'Downloaded Guide';
        else if (action === 'book') tag = 'Booked Demo';

        const lead = await Lead.create({
            name, email, phone, businessType, monthlyBudget, readyToAutomate, tag,
            utmSource, utmMedium, utmCampaign, utmContent, utmTerm, fbclid, referrer,
            booked: action === 'book'
        });

        // Trigger PDF Delivery Immediately if Path A
        if (action === 'download') {
            try {
                await sendEmail(
                    email,
                    'Your CRM Automation Guide inside \uD83D\uDCE6',
                    PDF_DELIVERY_TEMPLATE(name)
                );
            } catch (emailError) {
                console.error('Failed to send PDF delivery email:', emailError);
                // We don't want to crash the lead creation if email fails
            }
        }

        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update lead to booked status
// @route   PUT /api/leads/:id/book
// @access  Public
export const markLeadAsBooked = async (req, res) => {
    try {
        const { eventUri } = req.body;
        let bookingStartTime = null;
        let bookingEndTime = null;

        // Optionally fetch exact times if Calendly URI provided from the client-side webhook fallback
        if (eventUri && process.env.CALENDLY_PERSONAL_TOKEN) {
            try {
                const calendlyRes = await axios.get(eventUri, {
                    headers: { Authorization: `Bearer ${process.env.CALENDLY_PERSONAL_TOKEN}` }
                });
                if (calendlyRes.data.resource) {
                    bookingStartTime = new Date(calendlyRes.data.resource.start_time);
                    bookingEndTime = new Date(calendlyRes.data.resource.end_time);
                }
            } catch (fetchErr) {
                console.error("Failed to fetch Calendly event details:", fetchErr.message);
            }
        }

        const updates = { tag: 'Booked Demo', booked: true };
        if (bookingStartTime && bookingEndTime) {
            updates.bookingStartTime = bookingStartTime;
            updates.bookingEndTime = bookingEndTime;
        }

        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Admin)
export const getLeads = async (req, res) => {
    try {
        // Pagination, filtering can be added here
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Public
export const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/leads/stats
// @access  Private (Admin)
export const getStats = async (req, res) => {
    try {
        const totalLeads = await Lead.countDocuments();
        const downloadedGuide = await Lead.countDocuments({ tag: 'Downloaded Guide' });
        const bookedDemo = await Lead.countDocuments({ tag: 'Booked Demo' });

        // Calculate simple conversion rate (Booked / Total)
        const conversionRate = totalLeads === 0 ? 0 : ((bookedDemo / totalLeads) * 100).toFixed(2);

        res.status(200).json({
            success: true,
            data: {
                totalLeads,
                downloadedGuide,
                bookedDemo,
                conversionRate,
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
