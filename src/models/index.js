const mongoose = require('mongoose');

require('./Donation');
require('./Report');

/**
 * Returns the Campaign model. Loads the temporary stub only when Person 2's
 * model has not been registered yet.
 * @returns {import('mongoose').Model}
 */
function ensureCampaignModel() {
  if (!mongoose.models.Campaign) {
    require('./_stubCampaign');
  }
  return mongoose.model('Campaign');
}

module.exports = {
  ensureCampaignModel,
};
