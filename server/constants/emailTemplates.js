export const REMINDER_EMAIL_TEMPLATE = (lead) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-top: 4px solid #3b82f6; border-radius: 8px; }
        h2 { color: #1e3a8a; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Hi ${lead.name}, let's automate your growth.</h2>
        <p>I noticed you downloaded our automation guide yesterday.</p>
        <p>Reading the guide is a great first step, but if you want to skip the trial-and-error phase, we can show you exactly how this system applies to your specific business model.</p>
        <p>Let's hop on a quick 15-minute strategy call. No sales pressure, just pure value.</p>
        
        <center>
            <a href="https://lead.bitlancetechhub.com/booking?email=${encodeURIComponent(lead.email)}&userid=${lead._id}&phoneno=${encodeURIComponent(lead.phone)}&name=${encodeURIComponent(lead.name)}" class="btn">Book Your Free Strategy Demo</a>
        </center>
        
        <p>Looking forward to speaking with you!</p>
        <p><strong>- The AutoSync Team</strong></p>

        <div class="footer">
            <p>You received this email because you opted in on our website.</p>
        </div>
    </div>
</body>
</html>
`;


export const PDF_DELIVERY_TEMPLATE = (lead) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-top: 4px solid #10b981; border-radius: 8px; }
        h2 { color: #047857; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #10b981; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Your Automation Guide is Here! 🎉</h2>
        <p>Hi ${lead.name},</p>
        <p>Thank you for requesting the blueprint. As promised, you can download your free guide right below:</p>
        
        <center>
            <a href="https://example.com/dummy-guide.pdf" class="btn">Download Blueprint PDF</a>
        </center>
        
        <p>If you're ready to skip the DIY phase and have our team build this for you, you can <a href="https://lead.bitlancetechhub.com/booking?email=${encodeURIComponent(lead.email)}&userid=${lead._id}&phoneno=${encodeURIComponent(lead.phone)}&name=${encodeURIComponent(lead.name)}">book a free strategy mapping session here</a>.</p>
        
        <p>Best regards,</p>
        <p><strong>- The AutoSync Team</strong></p>
    </div>
</body>
</html>
`;

export const BOOKING_CONFIRMATION_TEMPLATE = (name, time) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-top: 4px solid #8b5cf6; border-radius: 8px; }
        h2 { color: #5b21b6; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Booking Confirmed! ✅</h2>
        <p>Hi ${name},</p>
        <p>Your strategy session is confirmed. We look forward to speaking with you about automating your CRM.</p>
        ${time ? `<p><strong>Time:</strong> ${time}</p>` : ''}
        <p>Please check your calendar for the meeting link.</p>
        <p>Best regards,</p>
        <p><strong>- The AutoSync Team</strong></p>
    </div>
</body>
</html>
`;
