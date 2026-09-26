const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

exports.sendOTP = async (email, otp) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 40px; border-radius: 20px;">
      <h2 style="color: #8b5cf6; margin-bottom: 20px;">Welcome to SkillSphere</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your verification code is:</p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px solid #334155;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #6366f1;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'SkillSphere - Email Verification',
    html
  });
};

exports.sendResetPassword = async (email, resetUrl) => {
  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 40px; border-radius: 20px;">
      <h2 style="color: #8b5cf6; margin-bottom: 20px;">Reset Your Password</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #64748b;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'SkillSphere - Password Reset',
    html
  });
};
