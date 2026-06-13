const cron = require('node-cron');
const pool = require('./db');
const { sendReminderEmail, sendInterviewEmail } = require('./email');

const startCronJobs = () => {
  // Check reminders every minute
  cron.schedule('* * * * *', async () => {
    try {
      // Find reminders that are due and not yet sent
      const { rows: reminders } = await pool.query(
        `SELECT r.*, u.email, u.name,
                a.job_title, c.name AS company_name
         FROM reminders r
         JOIN users u ON r.user_id = u.id
         LEFT JOIN applications a ON r.application_id = a.id
         LEFT JOIN companies c ON a.company_id = c.id
         WHERE r.remind_at <= NOW()
           AND r.is_sent = FALSE
           AND r.is_dismissed = FALSE`
      );

      for (const reminder of reminders) {
        try {
          await sendReminderEmail({
            to: reminder.email,
            title: reminder.title,
            jobTitle: reminder.job_title,
            companyName: reminder.company_name,
            remindAt: reminder.remind_at,
          });

          // Mark as sent
          await pool.query(
            'UPDATE reminders SET is_sent = TRUE WHERE id = $1',
            [reminder.id]
          );

          console.log(`Reminder email sent to ${reminder.email}: ${reminder.title}`);
        } catch (err) {
          console.error(`Failed to send reminder to ${reminder.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error('Cron job error (reminders):', err.message);
    }
  });

  // Check interviews every hour — send email 24hrs before
  cron.schedule('0 * * * *', async () => {
    try {
      const { rows: interviews } = await pool.query(
        `SELECT i.*, u.email, u.name,
                a.job_title, c.name AS company_name
         FROM interviews i
         JOIN users u ON i.user_id = u.id
         JOIN applications a ON i.application_id = a.id
         LEFT JOIN companies c ON a.company_id = c.id
         WHERE i.scheduled_at BETWEEN NOW() + INTERVAL '23 hours'
                                   AND NOW() + INTERVAL '25 hours'
           AND i.reminder_sent = FALSE`
      );

      for (const interview of interviews) {
        try {
          await sendInterviewEmail({
            to: interview.email,
            jobTitle: interview.job_title,
            companyName: interview.company_name,
            scheduledAt: interview.scheduled_at,
            interviewType: interview.interview_type,
            location: interview.location,
          });

          // Mark reminder as sent
          await pool.query(
            'UPDATE interviews SET reminder_sent = TRUE WHERE id = $1',
            [interview.id]
          );

          console.log(`Interview reminder sent to ${interview.email}: ${interview.job_title}`);
        } catch (err) {
          console.error(`Failed to send interview reminder to ${interview.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error('Cron job error (interviews):', err.message);
    }
  });

  console.log('Cron jobs started');
};

module.exports = startCronJobs;