const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * POST /api/reports
 * @type {import('express').RequestHandler}
 */
async function create(req, res) {
  const data = await reportService.createReport({ user: req.user, body: req.validated });
  sendSuccess(res, { status: 201, message: 'Report filed', data });
}

/**
 * GET /api/reports/mine
 * @type {import('express').RequestHandler}
 */
async function mine(req, res) {
  const data = await reportService.listMyReports(req.user, req.validatedQuery);
  sendSuccess(res, { message: 'Your reports', data });
}

module.exports = { create, mine };
