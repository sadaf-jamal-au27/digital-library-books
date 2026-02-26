import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to, otp) {
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.FROM_NAME || 'Digital Library';
  await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to,
    subject: 'Your password reset OTP',
    text: `Your OTP to reset your password is: ${otp}\n\nIt expires in 10 minutes.`,
    html: `<p>Your OTP to reset your password is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
  });
}

export function isMailConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}
