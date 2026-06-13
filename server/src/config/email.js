const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminderEmail = async ({ to, title, jobTitle, companyName, remindAt }) => {
  const mailOptions = {
    from: `Trackr <${process.env.EMAIL_USER}>`,
    to,
    subject: `Reminder: ${title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #534AB7;">Trackr Reminder</h2>
        <p>Hi there,</p>
        <p>This is a reminder for:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${title}</strong><br/>
          ${jobTitle ? `Role: ${jobTitle}<br/>` : ''}
          ${companyName ? `Company: ${companyName}<br/>` : ''}
          Due: ${new Date(remindAt).toLocaleString()}
        </div>
        <p>Good luck with your job search!</p>
        <p style="color: #999; font-size: 12px;">— Trackr</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendInterviewEmail = async ({ to, jobTitle, companyName, scheduledAt, interviewType, location }) => {
  const mailOptions = {
    from: `Trackr <${process.env.EMAIL_USER}>`,
    to,
    subject: `Interview Tomorrow: ${jobTitle} at ${companyName || 'Unknown Company'}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #534AB7;">Interview Reminder</h2>
        <p>Hi there,</p>
        <p>You have an interview coming up tomorrow!</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong>${jobTitle}</strong><br/>
          ${companyName ? `Company: ${companyName}<br/>` : ''}
          Type: ${interviewType.replace('_', ' ')}<br/>
          Time: ${new Date(scheduledAt).toLocaleString()}<br/>
          ${location ? `Location: ${location}<br/>` : ''}
        </div>
        <p>Make sure you're prepared. Good luck!</p>
        <p style="color: #999; font-size: 12px;">— Trackr</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendReminderEmail, sendInterviewEmail };