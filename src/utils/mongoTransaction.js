const mongoose = require('mongoose');

let transactionSupport;

/**
 * Replica sets and mongos support multi-document transactions. A standalone
 * local MongoDB does not. The result is cached for the life of the process.
 * @returns {Promise<boolean>}
 */
async function supportsTransactions() {
  if (transactionSupport !== undefined) return transactionSupport;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    transactionSupport = Boolean(hello.setName || hello.msg === 'isdbgrid');
  } catch {
    transactionSupport = false;
  }
  return transactionSupport;
}

/**
 * Runs `work(session)` inside a transaction when the server supports it.
 * Otherwise runs `work(null)` so the caller can use an atomic conditional update.
 * External HTTP (provider verify) must happen before this, not inside `work`.
 *
 * @template T
 * @param {(session: import('mongoose').ClientSession | null) => Promise<T>} work
 * @returns {Promise<T>}
 */
async function runAtomically(work) {
  if (!(await supportsTransactions())) {
    return work(null);
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = {
  supportsTransactions,
  runAtomically,
};
