const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Report = require('../models/Report');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const REPORT_CATEGORIES = ['False Information', 'Fraud / Scam', 'Misleading Content', 'Other'];
const REPORT_STATUSES = ['reviewed', 'resolved', 'dismissed'];

exports.create = async (req, res) => {
  const { campaignId, category, details, evidence = [] } = req.body || {};
  if (!mongoose.isValidObjectId(campaignId)) {
    throw new AppError('A valid campaign ID is required', 400, 'VALIDATION_ERROR', {
      campaignId: 'A valid campaign ID is required',
    });
  }
  if (!REPORT_CATEGORIES.includes(category)) {
    throw new AppError('Select a valid report category', 400, 'VALIDATION_ERROR', {
      category: 'Select a valid report category',
    });
  }
  if (typeof details !== 'string' || !details.trim() || details.trim().length > 2000) {
    throw new AppError('Report details must be between 1 and 2000 characters', 400, 'VALIDATION_ERROR', {
      details: 'Report details must be between 1 and 2000 characters',
    });
  }
  if (!Array.isArray(evidence) || evidence.length > 10 ||
      evidence.some((item) => typeof item !== 'string' || item.trim().length > 2048)) {
    throw new AppError('Evidence must contain at most 10 links of 2048 characters or fewer', 400, 'VALIDATION_ERROR', {
      evidence: 'Evidence must contain at most 10 links of 2048 characters or fewer',
    });
  }
  if (!(await Campaign.exists({ _id: campaignId }))) {
    throw new AppError('Campaign not found', 404, 'CAMPAIGN_NOT_FOUND');
  }

  const report = await Report.create({
    reporterId: req.user._id,
    campaignId,
    category,
    details: details.trim(),
    evidence: evidence.map((item) => item.trim()).filter(Boolean),
  });
  sendSuccess(res, 'Report submitted', { report }, 201);
};

exports.getMine = async (req, res) => {
  const reports = await Report.find({ reporterId: req.user._id }).sort({ createdAt: -1 }).lean();
  sendSuccess(res, 'Reports loaded', { items: reports });
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
  }
  const { status, note } = req.body || {};
  if (!REPORT_STATUSES.includes(status)) {
    throw new AppError('Unsupported report status', 400, 'VALIDATION_ERROR', {
      status: 'Must be reviewed, resolved or dismissed',
    });
  }
  if (note !== undefined && (typeof note !== 'string' || note.trim().length > 1000)) {
    throw new AppError('Report note must be 1000 characters or fewer', 400, 'VALIDATION_ERROR', {
      note: 'Report note must be 1000 characters or fewer',
    });
  }

  const report = await Report.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        reviewedBy: req.user._id,
        ...(note === undefined ? {} : { resolutionNote: note.trim() }),
      },
    },
    { new: true, runValidators: true }
  );
  if (!report) throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
  sendSuccess(res, 'Report updated', { report });
};
