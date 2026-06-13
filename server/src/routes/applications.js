const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/applications
router.get('/', async (req, res) => {
  const { status, search } = req.query;
  let query = `
    SELECT a.*, c.name AS company_name
    FROM applications a
    LEFT JOIN companies c ON a.company_id = c.id
    WHERE a.user_id = $1
  `;
  const params = [req.user.id];

  if (status) {
    params.push(status);
    query += ` AND a.status = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (a.job_title ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
  }

  query += ' ORDER BY a.created_at DESC';

  try {
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /api/applications/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, c.name AS company_name
       FROM applications a
       LEFT JOIN companies c ON a.company_id = c.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    const interviews = await pool.query(
      'SELECT * FROM interviews WHERE application_id = $1 ORDER BY scheduled_at ASC',
      [req.params.id]
    );

    res.json({ ...rows[0], interviews: interviews.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// POST /api/applications
router.post('/', async (req, res) => {
  const { company_id, job_title, job_url, location, salary_min, salary_max, remote, status, applied_date, notes } = req.body;

  if (!job_title)
    return res.status(400).json({ error: 'job_title is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO applications
        (user_id, company_id, job_title, job_url, location, salary_min, salary_max, remote, status, applied_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [req.user.id, company_id, job_title, job_url, location, salary_min, salary_max,
       remote || false, status || 'applied', applied_date, notes]
    );

    await pool.query(
      `INSERT INTO activity_log (user_id, application_id, event_type, new_value)
       VALUES ($1, $2, 'application_created', $3)`,
      [req.user.id, rows[0].id, status || 'applied']
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// PATCH /api/applications/:id
router.patch('/:id', async (req, res) => {
  const allowed = ['company_id','job_title','job_url','location','salary_min',
                   'salary_max','remote','status','applied_date','response_date','notes'];
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
    if (req.body.status) {
      const current = await pool.query(
        'SELECT status FROM applications WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );
      if (current.rows[0]?.status !== req.body.status) {
        await pool.query(
          `INSERT INTO activity_log (user_id, application_id, event_type, old_value, new_value)
           VALUES ($1, $2, 'status_changed', $3, $4)`,
          [req.user.id, req.params.id, current.rows[0].status, req.body.status]
        );
      }
    }

    const { rows } = await pool.query(
      `UPDATE applications SET ${updates.join(', ')}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING *`,
      values
    );

    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM applications WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;