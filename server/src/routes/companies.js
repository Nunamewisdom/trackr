const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/companies
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM companies WHERE user_id = $1 ORDER BY name ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// POST /api/companies
router.post('/', async (req, res) => {
  const { name, website, industry, location, notes } = req.body;

  if (!name)
    return res.status(400).json({ error: 'name is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO companies (user_id, name, website, industry, location, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, name, website, industry, location, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// PATCH /api/companies/:id
router.patch('/:id', async (req, res) => {
  const allowed = ['name', 'website', 'industry', 'location', 'notes'];
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
      `UPDATE companies SET ${updates.join(', ')}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// DELETE /api/companies/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM companies WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

module.exports = router;