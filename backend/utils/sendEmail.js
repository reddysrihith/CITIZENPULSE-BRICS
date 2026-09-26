const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('==================== EMAIL SENT ====================');
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Content: ${options.message}`);
  console.log('====================================================');

  if (process.env.NODE_ENV === 'development' && process.env.SMTP_SEND_IN_DEVELOPMENT !== 'true') {
    // In development, we don't need real SMTP. The console output contains the OTP.
    return;
  }

  // Create a transporter using ethereal email or generic SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL || process.env.SMTP_USER || 'test@ethereal.email',
      pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || 'testpassword',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'SkillSphere'} <${process.env.FROM_EMAIL || 'noreply@skillsphere.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('SMTP Error:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
