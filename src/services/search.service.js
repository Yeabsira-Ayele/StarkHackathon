const mongoose = require('mongoose');
const { ensureCampaignModel } = require('../models');
const { escapeRegex } = require('../utils/escapeRegex');
const { buildPagination } = require('../utils/pagination');
const { CAMPAIGN_PUBLIC_FIELDS, CAMPAIGN_PUBLIC_STATUSES } = require('../config/constants');

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  mostFunded: { raisedAmount: -1, createdAt: -1 },
  endingSoon: { deadline: 1, createdAt: -1 },
};

/**
 * Whitelisted public campaign shape. Payout accounts and beneficiary details
 * are never copied, even if the document has them.
 * @param {object} doc
 */
function toPublicCampaign(doc) {
  return {
    id: String(doc._id),
    title: doc.title || null,
    story: doc.story || null,
    category: doc.category ? String(doc.category) : null,
    location: doc.location || null,
    goalAmount: doc.goalAmount,
    raisedAmount: doc.raisedAmount ?? 0,
    deadline: doc.deadline || null,
    status: doc.status,
    verificationStatus: doc.verificationStatus || null,
    organization: doc.organization ? String(doc.organization) : null,
    owner: doc.owner ? String(doc.owner) : null,
    createdAt: doc.createdAt || null,
  };
}

/**
 * Public campaign discovery. Drafts are never returned.
 * Keyword search uses a case-insensitive escaped regex on title and story.
 * Campaign also has a text index (title + story) for deployments that prefer $text.
 *
 * @param {{
 *   q?: string,
 *   category?: string,
 *   location?: string,
 *   verification?: 'verified' | 'unverified',
 *   organization?: string,
 *   status?: 'published' | 'completed',
 *   sort?: 'newest' | 'oldest' | 'mostFunded' | 'endingSoon' | 'progress',
 *   page: number,
 *   limit: number,
 * }} query
 * @returns {Promise<{ items: object[], pagination: { page: number, limit: number, total: number, totalPages: number, hasNext: boolean } }>}
 */
async function searchCampaigns(query) {
  const Campaign = ensureCampaignModel();
  const filter = {};

  if (query.status && CAMPAIGN_PUBLIC_STATUSES.includes(query.status)) {
    filter.status = query.status;
  } else {
    filter.status = { $in: CAMPAIGN_PUBLIC_STATUSES };
  }

  if (query.q) {
    const pattern = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ title: pattern }, { story: pattern }];
  }
  if (query.location) {
    filter.location = new RegExp(`^${escapeRegex(query.location)}$`, 'i');
  }
  if (query.category) filter.category = new mongoose.Types.ObjectId(query.category);
  if (query.organization) filter.organization = new mongoose.Types.ObjectId(query.organization);
  if (query.verification) filter.verificationStatus = query.verification;

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const sortKey = query.sort && SORTS[query.sort] ? query.sort : 'newest';

  const total = await Campaign.countDocuments(filter);

  let docs;
  if (sortKey === 'progress') {
    docs = await Campaign.aggregate([
      { $match: filter },
      {
        $addFields: {
          progress: {
            $cond: [
              { $gt: ['$goalAmount', 0] },
              { $divide: ['$raisedAmount', '$goalAmount'] },
              0,
            ],
          },
        },
      },
      { $sort: { progress: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          story: 1,
          category: 1,
          location: 1,
          goalAmount: 1,
          raisedAmount: 1,
          deadline: 1,
          status: 1,
          verificationStatus: 1,
          organization: 1,
          owner: 1,
          createdAt: 1,
        },
      },
    ]);
  } else {
    docs = await Campaign.find(filter)
      .sort(SORTS[sortKey])
      .skip(skip)
      .limit(limit)
      .select(CAMPAIGN_PUBLIC_FIELDS.join(' '))
      .lean();
  }

  return {
    items: docs.map(toPublicCampaign),
    pagination: buildPagination({ page, limit, total }),
  };
}

module.exports = {
  searchCampaigns,
};
