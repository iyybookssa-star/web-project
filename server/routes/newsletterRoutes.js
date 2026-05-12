const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Create a transporter — uses Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// POST /api/newsletter/subscribe
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    try {
        const info = await transporter.sendMail({
            from: `"Partify Pro" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🎉 Welcome to Partify Pro!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1117; color: #ffffff; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #394AE2, #2835c4); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px;">PARTIFY PRO</h1>
                        <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.8;">High-Performance Car Parts</p>
                    </div>
                    <div style="padding: 40px 30px; text-align: center;">
                        <h2 style="font-size: 24px; margin: 0 0 16px;">Thank You for Subscribing! 🚗</h2>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                            Welcome to the Partify Pro family! You'll now receive exclusive deals, 
                            new product alerts, and expert car maintenance tips straight to your inbox.
                        </p>
                        <div style="background: #1a1d2e; border-radius: 12px; padding: 20px; margin: 24px 0;">
                            <p style="color: #394AE2; font-weight: bold; font-size: 18px; margin: 0 0 4px;">🏷️ 15% OFF YOUR FIRST ORDER</p>
                            <p style="color: #64748b; font-size: 13px; margin: 0;">Use code: <strong style="color: #fff;">WELCOME15</strong></p>
                        </div>
                        <a href="https://iyybookssa-star.github.io/web-project/" 
                           style="display: inline-block; background: #394AE2; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
                            SHOP NOW
                        </a>
                    </div>
                    <div style="padding: 20px 30px; text-align: center; border-top: 1px solid #1e2030;">
                        <p style="color: #475569; font-size: 11px; margin: 0;">
                            © 2024 Partify Pro. All rights reserved.<br>
                            You received this email because you subscribed at partifypro.com
                        </p>
                    </div>
                </div>
            `,
        });

        console.log('[Newsletter] Email sent! ID:', info.messageId);
        res.json({ message: 'Subscription successful! Check your inbox.' });
    } catch (err) {
        console.error('[Newsletter] Email send FAILED:', err.message);
        res.status(500).json({ message: 'Failed to send email. Please try again later.' });
    }
});

module.exports = router;
