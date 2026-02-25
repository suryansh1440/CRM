import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    businessType: { type: String, enum: ['Real Estate', 'Clinic', 'Education', 'Other'] },
    monthlyBudget: { type: String, enum: ['< 10k', '10k - 50k', '50k+'] },
    readyToAutomate: { type: Boolean },
    source: { type: String, default: 'Meta Ad' },
    tag: { type: String, enum: ['Downloaded Guide', 'Booked Demo', 'New Lead'], default: 'New Lead' },
    booked: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    bookingStartTime: { type: Date },
    bookingEndTime: { type: Date },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmContent: { type: String },
    utmTerm: { type: String },
    fbclid: { type: String },
    referrer: { type: String },
}, { timestamps: true });

// Indexes for faster querying in cron jobs and admin panel
leadSchema.index({ tag: 1, booked: 1, reminderSent: 1, createdAt: 1 });

export const Lead = mongoose.model('Lead', leadSchema);
