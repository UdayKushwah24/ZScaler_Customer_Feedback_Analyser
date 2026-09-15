const express = require('express');
const cors = require('cors');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/feedback', feedbackRoutes);

// 404 for anything else under /api
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Centralized error handler — catches sync throws and rejected promises
// forwarded via next(err) from any route.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
