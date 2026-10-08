const assert = require('node:assert/strict');
const { test } = require('node:test');
const { validateSavedCampaigns } = require('../src/validators/authValidators');

test('accepts an empty saved-causes list and valid campaign IDs', () => {
  assert.doesNotThrow(() => validateSavedCampaigns({ campaignIds: [] }));
  assert.doesNotThrow(() => validateSavedCampaigns({
    campaignIds: ['507f1f77bcf86cd799439011', '507f191e810c19729de860ea'],
  }));
});

test('rejects invalid saved-causes payloads', () => {
  assert.throws(() => validateSavedCampaigns({ campaignIds: '507f1f77bcf86cd799439011' }), {
    code: 'VALIDATION_ERROR',
    fields: { campaignIds: 'Campaign IDs must be an array' },
  });
  assert.throws(() => validateSavedCampaigns({ campaignIds: ['not-an-object-id'] }), {
    code: 'VALIDATION_ERROR',
    fields: { campaignIds: 'Every campaign ID must be a valid ID' },
  });
});

test('caps saved causes at 500 IDs', () => {
  const campaignIds = Array.from({ length: 501 }, (_, index) =>
    (index + 1).toString(16).padStart(24, '0')
  );
  assert.throws(() => validateSavedCampaigns({ campaignIds }), {
    code: 'VALIDATION_ERROR',
    fields: { campaignIds: 'You can save at most 500 causes' },
  });
});
