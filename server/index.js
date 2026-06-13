const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',         require('./src/routes/auth'));
app.use('/api/applications', require('./src/routes/applications'));
app.use('/api/companies',    require('./src/routes/companies'));
app.use('/api/interviews',   require('./src/routes/interviews'));
app.use('/api/reminders',    require('./src/routes/reminders'));
app.use('/api/analytics',    require('./src/routes/analytics'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Trackr API running on http://localhost:${PORT}`);
  
  // Start cron jobs after server starts
  const startCronJobs = require('./src/config/cron');
  startCronJobs();
});