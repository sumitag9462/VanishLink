// server/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter lazily if environment variables are provided
let transporter = null;
const isConfigured = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

if (isConfigured) {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends an OTP email to the visitor.
 * Falls back to console log if SMTP is not configured.
 *
 * @param {string} toEmail - Recipient email.
 * @param {string} code - OTP code.
 * @param {string} slug - Short link slug.
 */
async function sendOtpEmail(toEmail, code, slug) {
  const subject = `🔒 VanishLink OTP: Verify access to /r/${slug}`;
  const htmlContent = `
    <div style="font-family: monospace; background-color: #020617; color: #f8fafc; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
      <h2 style="color: #10b981; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">💀 VANISHLINK SECURE ACCESS</h2>
      <p style="font-size: 14px; color: #94a3b8;">A request was made to decrypt and follow the secure link with slug <strong>/r/${slug}</strong>.</p>
      <p style="font-size: 14px; color: #94a3b8;">Your 5-minute single-use OTP is:</p>
      <div style="background-color: #0f172a; border: 1px dashed #10b981; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #10b981; margin: 20px 0; border-radius: 4px;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #64748b;">If you did not request this code, please ignore this email. The link will remain encrypted.</p>
      <hr style="border: none; border-top: 1px solid #1e293b; margin: 20px 0;" />
      <p style="font-size: 10px; text-align: center; color: #475569;">VanishLink Security System</p>
    </div>
  `;

  if (isConfigured && transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"VanishLink" <security@vanishlink.local>',
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });
      console.log(`📧 Sent OTP email to ${toEmail} successfully`);
      return true;
    } catch (err) {
      console.error('❌ Failed to send OTP email via SMTP:', err);
    }
  }

  // Fallback to console printing
  console.log('\n==================================================');
  console.log(`🔒 [MOCK EMAIL SERVICE]`);
  console.log(`To:      ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`OTP Code: ${code}`);
  console.log('==================================================\n');
  return true;
}

module.exports = {
  sendOtpEmail,
};
