const mongoose = require('mongoose');
const Report = require('../models/Report');
const { isObjectId } = require('../utils/objectId');
const Donation = require('../models/Donation');
const { ensureCampaignModel } = require('../models');
const AppError = require('../utils/AppError');
const { buildPagination } = require('../utils/pagination');
const { emit } = require('./events');
const { REPORT_STATUSES, MAX_REPORT_DETAILS } = require('../config/constants');

/**
 * @param {object} report
 */
function serializeReport(report) {
  const doc = report && typeof report.toObject === 'function' ? report.toObject() : report;
  return {
    id: String(doc._id),
    reporter: String(doc.reporter),
    targetType: doc.targetType,
    targetId: String(doc.targetId),
    reason: doc.reason,
    details: doc.details || null,
    status: doc.status,
    adminNote: doc.adminNote || null,
    resolvedBy: doc.resolvedBy ? String(doc.resolvedBy) : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * @param {string} value
 * @returns {string}
 */
function cleanDetails(value) {
  return String(value).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, MAX_REPORT_DETAILS);
}

/**
 * Confirms the report target exists. User and Organization models belong to
 * Person 1; if they are not registered yet, this throws TARGET_MODEL_UNAVAILABLE.
 * @param {string} targetType
 * @param {string} targetId
 * @param {string} reporterId
 */
async function assertTarget(targetType, targetId, reporterId) {
  if (targetType === 'user' && String(targetId) === String(reporterId)) {
    throw new AppError('You cannot report yourself', 400, 'SELF_REPORT');
  }

  if (targetType === 'donation') {
    const donation = await Donation.findById(targetId).select('_id donor');
    if (!donation) throw new AppError('Target not found', 404, 'NOT_FOUND');
    if (!donation.donor || String(donation.donor) !== String(reporterId)) {
      throw new AppError('You can only report a donation you made', 403, 'FORBIDDEN');
    }
    return;
  }

  if (targetType === 'campaign') {
    const Campaign = ensureCampaignModel();
    const campaign = await Campaign.findById(targetId).select('_id');
    if (!campaign) throw new AppError('Target not found', 404, 'NOT_FOUND');
    return;
  }

  const modelName = targetType === 'user' ? 'User' : 'Organization';
  if (!mongoose.models[modelName]) {
    throw new AppError(`${modelName} model is not loaded yet`, 503, 'TARGET_MODEL_UNAVAILABLE');
  }
  const doc = await mongoose.model(modelName).findById(targetId).select('_id');
  if (!doc) throw new AppError('Target not found', 404, 'NOT_FOUND');
}

/**
 * Files a report. Duplicate open reports from the same user on the same target
 * are rejected. Does not accept status or adminNote from the client.
 *
 * @param {{ user: { _id: string }, body: { targetType: string, targetId: string, reason: string, details?: string } }} input
 * @returns {Promise<object>}
 */
async function createReport({ user, body }) {
  await assertTarget(body.targetType, body.targetId, user._id);

  const existing = await Report.findOne({
    reporter: user._id,
    targetType: body.targetType,
    targetId: body.targetId,
    status: 'open',
  }).select('_id');

  if (existing) {
    throw new AppError('You already have an open report for this target', 409, 'DUPLICATE_REPORT');
  }

  try {
    const report = await Report.create({
      reporter: user._id,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      details: body.details ? cleanDetails(body.details) : undefined,
      status: 'open',
    });

    emit('report.created', {
      reportId: String(report._id),
      reporterId: String(user._id),
      targetType: report.targetType,
      targetId: String(report.targetId),
      reason: report.reason,
    });

    return serializeReport(report);
  } catch (err) {
    if (err && err.code === 11000) {
      throw new AppError('You already have an open report for this target', 409, 'DUPLICATE_REPORT');
    }
    throw err;
  }
}

/**
 * Reports filed by the signed-in user, newest first.
 * @param {{ _id: string }} user
 * @param {{ page: number, limit: number }} query
 */
async function listMyReports(user, query) {
  const page = query.page;
  const limit = query.limit;
  const filter = { reporter: user._id };
  const [total, docs] = await Promise.all([
    Report.countDocuments(filter),
    Report.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  return {
    items: docs.map(serializeReport),
    pagination: buildPagination({ page, limit, total }),
  };
}

/**
 * Person 4: list reports for the admin queue.
 * This function does not check the caller. The admin route must authorize first.
 *
 * @param {{ status?: string, targetType?: string, page?: number, limit?: number }} [filters]
 * @returns {Promise<{ items: object[], pagination: object }>}
 */
async function listReports(filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(filters.limit) || 12));
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.targetType) query.targetType = filters.targetType;

  const [total, docs] = await Promise.all([
    Report.countDocuments(query),
    Report.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  return {
    items: docs.map(serializeReport),
    pagination: buildPagination({ page, limit, total }),
  };
}

/**
 * Person 4: fetch one report. Does not authorize the caller.
 * @param {string} id
 * @returns {Promise<object>}
 */
async function getReport(id) {
  if (!isObjectId(id)) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', { id: 'Must be a valid id' });
  }
  const report = await Report.findById(id).lean();
  if (!report) throw new AppError('Report not found', 404, 'NOT_FOUND');
  return serializeReport(report);
}

/**
 * Person 4: move a report through open → reviewing → resolved or dismissed.
 * Does not authorize the caller. `adminId` is stored on resolvedBy.
 *
 * @param {string} id
 * @param {{ status: string, adminNote?: string, adminId: string }} input
 * @returns {Promise<object>}
 */
async function updateReportStatus(id, { status, adminNote, adminId }) {
  if (!isObjectId(id)) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', { id: 'Must be a valid id' });
  }
  if (!REPORT_STATUSES.includes(status)) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', { status: 'Invalid status' });
  }
  if (!adminId || !isObjectId(String(adminId))) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', { adminId: 'Must be a valid id' });
  }

  const report = await Report.findById(id);
  if (!report) throw new AppError('Report not found', 404, 'NOT_FOUND');

  report.status = status;
  if (adminNote !== undefined) report.adminNote = cleanDetails(adminNote);
  report.resolvedBy = adminId;
  await report.save();
  return serializeReport(report);
}

module.exports = {
  createReport,
  listMyReports,
  listReports,
  getReport,
  updateReportStatus,
};
