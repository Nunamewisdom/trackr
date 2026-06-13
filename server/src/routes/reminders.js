const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/reminders
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, a.job_title, c.name AS company_name
       FROM reminders r
       LEFT JOIN applications a ON r.application_id = a.id
       LEFT JOIN companies c ON a.company_id = c.id
       WHERE r.user_id = $1 AND r.is_dismissed = FALSE
       ORDER BY r.remind_at ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// POST /api/reminders
router.post('/', async (req, res) => {
  const { application_id, title, reminder_type, remind_at } = req.body;

  if (!title || !remind_at)
    return res.status(400).json({ error: 'title and remind_at are required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO reminders (user_id, application_id, title, reminder_type, remind_at)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, application_id, title, reminder_type || 'custom', remind_at]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// PATCH /api/reminders/:id/dismiss
router.patch('/:id/dismiss', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE reminders SET is_dismissed = TRUE
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Reminder dismissed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dismiss reminder' });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

module.exports = router;