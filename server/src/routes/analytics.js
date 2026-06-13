const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id;

    const [totals, responseRate, avgResponse, weekly] = await Promise.all([
      pool.query(
        `SELECT status, COUNT(*) AS count
         FROM applications WHERE user_id = $1
         GROUP BY status`,
        [userId]
      ),
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE status != 'saved' AND status != 'applied') AS responded,
           COUNT(*) FILTER (WHERE status != 'saved') AS total_applied
         FROM applications WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT ROUND(AVG(response_date - applied_date)) AS avg_days
         FROM applications
         WHERE user_id = $1
           AND response_date IS NOT NULL
           AND applied_date IS NOT NULL`,
        [userId]
      ),
      pool.query(
        `SELECT
           DATE_TRUNC('week', applied_date) AS week,
           COUNT(*) AS count
         FROM applications
         WHERE user_id = $1
           AND applied_date >= NOW() - INTERVAL '8 weeks'
         GROUP BY week
         ORDER BY week ASC`,
        [userId]
      ),
    ]);

    const byStatus = {};
    totals.rows.forEach(r => { byStatus[r.status] = parseInt(r.count); });

    const { responded, total_applied } = responseRate.rows[0];
    const rate = total_applied > 0
      ? Math.round((responded / total_applied) * 100)
      : 0;

    res.json({
      byStatus,
      totalApplied:    parseInt(total_applied) || 0,
      responseRate:    rate,
      avgResponseDays: parseInt(avgResponse.rows[0]?.avg_days) || null,
      weeklyActivity:  weekly.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;