require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes');
const campaignRoutes = require('./src/routes/CampaignRoutes');
const donationRoutes = require('./src/routes/donationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.get('/', (_req, res) => res.json({ message: 'Lewegene API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api', campaignRoutes);
app.use('/api', donationRoutes);
app.use('/api', adminRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
});

async function start() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }

  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => console.log(`Lewegene API listening on port ${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error(`Could not start Lewegene API: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;