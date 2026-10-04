const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const paymentController = require('../controllers/payment.controller');

/**
 * Mounts POST /api/payments/webhook with express.raw.
 * Call this BEFORE app.use(express.json()).
 * @param {import('express').Express} app
 */
function mountPaymentWebhook(app) {
  app.post(
    '/api/payments/webhook',
    express.raw({ type: () => true, limit: '256kb' }),
    asyncHandler(paymentController.webhook)
  );
}

module.exports = { mountPaymentWebhook };
