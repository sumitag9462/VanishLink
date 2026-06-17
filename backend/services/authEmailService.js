const nodemailer = require('nodemailer');

function buildTransport() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function sendOTP(email, code, purpose = 'otp') {
  const transporter = buildTransport();
  const subject =
    purpose === 'reset'
      ? 'Your VanishLink password reset code'
      : 'Your VanishLink verification code';
  const text = `Your code is ${code}. It expires in 10 minutes.`;

  if (!transporter) {
    console.log(`[OTP] ${purpose} for ${email}: ${code} (email not configured)`);
    return { mode: 'console' };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    });
    return { mode: 'email' };
  } catch (err) {
    console.error('Failed to send email OTP, falling back to console:', err);
    console.log(`[OTP] ${purpose} for ${email}: ${code}`);
    return { mode: 'console' };
  }
}

module.exports = { sendOTP };
