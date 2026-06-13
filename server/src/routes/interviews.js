const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/interviews
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, a.job_title, c.name AS company_name
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       LEFT JOIN companies c ON a.company_id = c.id
       WHERE i.user_id = $1
       ORDER BY i.scheduled_at ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// POST /api/interviews
router.post('/', async (req, res) => {
  const { application_id, interview_type, scheduled_at, duration_mins, location, interviewer, prep_notes } = req.body;

  if (!application_id || !scheduled_at)
    return res.status(400).json({ error: 'application_id and scheduled_at are required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO interviews
        (application_id, user_id, interview_type, scheduled_at, duration_mins, location, interviewer, prep_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [application_id, req.user.id, interview_type || 'other',
       scheduled_at, duration_mins || 60, location, interviewer, prep_notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

// PATCH /api/interviews/:id
router.patch('/:id', async (req, res) => {
  const allowed = ['interview_type', 'scheduled_at', 'duration_mins', 'location', 'interviewer', 'prep_notes', 'outcome_notes'];
  const updates = [];
  const values = [];

  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      values.push(req.body[field]);
      updates.push(`${field} = $${values.length}`);
    }
  });

  if (!updates.length)
    return res.status(400).json({ error: 'No valid fields to update' });

  values.push(req.params.id, req.user.id);

  try {
    const { rows } = await pool.query(
      `UPDATE interviews SET ${updates.join(', ')}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update interview' });
  }
});

// DELETE /api/interviews/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM interviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete interview' });
  }
});

module.exports = router;