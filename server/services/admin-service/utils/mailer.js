import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
console.log('Mailer config:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
});

function otpHtmlTemplate(otp) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; border:1px solid #eee; border-radius:8px; padding:24px; background:#fafbfc;">
      <h2 style="color:#2563eb; margin-bottom:16px;">LabourHunt Admin Password Reset</h2>
      <p style="font-size:16px; color:#222;">Your One-Time Password (OTP) is:</p>
      <div style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#2563eb; margin:16px 0;">${otp}</div>
      <p style="font-size:14px; color:#555;">This OTP will expire in <b>10 minutes</b>.</p>
      <p style="font-size:13px; color:#888; margin-top:24px;">If you did not request this, please ignore this email.</p>
      <div style="margin-top:32px; font-size:12px; color:#aaa;">&copy; ${new Date().getFullYear()} LabourHunt</div>
    </div>
  `;
}

export async function sendMail({ to, subject, text, html, type, otp }) {
  let finalHtml = html;
  if (type === 'otp' && otp) {
    finalHtml = otpHtmlTemplate(otp);
  }
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html: finalHtml,
  });
} 