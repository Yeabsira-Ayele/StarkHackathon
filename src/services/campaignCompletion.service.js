const mongoose = require('mongoose');

/**
 * If a published campaign has reached its goal, mark it completed.
 * Person 2 can call this after any other credit to raisedAmount.
 *
 * Also sets `isOpen` to false. Person 2's Campaign uses that flag in a partial
 * unique index (one open campaign per owner). The temporary stub schema does
 * not define `isOpen`, so Mongoose drops it there.
 *
 * @param {import('mongoose').Types.ObjectId | string} campaignId
 * @param {import('mongoose').ClientSession | null} [session]
 * @returns {Promise<{ completed: boolean, campaign: import('mongoose').Document | null }>}
 */
async function completeIfGoalReached(campaignId, session = null) {
  const Campaign = mongoose.model('Campaign');
  const options = { new: true };
  if (session) options.session = session;

  const campaign = await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      status: 'published',
      $expr: {
        $and: [
          { $gt: ['$goalAmount', 0] },
          {
            $gte: [
              { $round: ['$raisedAmount', 2] },
              { $round: ['$goalAmount', 2] },
            ],
          },
        ],
      },
    },
    {
      $set: {
        status: 'completed',
        completedAt: new Date(),
        isOpen: false,
      },
    },
    options
  );

  return {
    completed: Boolean(campaign),
    campaign,
  };
}

module.exports = {
  completeIfGoalReached,
};
