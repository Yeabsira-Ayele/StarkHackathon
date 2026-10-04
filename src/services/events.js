/**
 * Notification hook.
 * TEMP: logs only. Person 4 will replace this with real notifications.
 * Events emitted by Person 3: donation.paid, donation.failed, report.created.
 */

/**
 * Drops fields that must never land in logs.
 * Fully anonymous donors are omitted from the log line; the in-memory payload
 * Person 4 receives still includes donorId so they can notify the donor.
 * @param {object} payload
 */
function redactForLog(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const safe = { ...payload };
  delete safe.rawProviderPayload;
  delete safe.phone;
  delete safe.customer;
  delete safe.apiKey;
  if (safe.identityMode === 'fully_anonymous') delete safe.donorId;
  return safe;
}

/**
 * @param {string} eventName
 * @param {object} [payload]
 */
function emit(eventName, payload = {}) {
  console.info(`[events] ${eventName}`, redactForLog(payload));
}

module.exports = { emit };
