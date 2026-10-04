const express = require('express');
const { ensureCampaignModel } = require('./models');
const { mountPaymentWebhook } = require('./routes/payment.routes');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

ensureCampaignModel();

const app = express();

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mock-signature');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Webhook needs the raw body for signature checks. Mount before express.json().
mountPaymentWebhook(app);

app.use(express.json({ limit: '100kb' }));
app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
