const { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } = require('../config/constants');

/**
 * @param {{ page: number, limit: number, total: number }} input
 */
function buildPagination({ page, limit, total }) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
  };
}

module.exports = {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  buildPagination,
};
