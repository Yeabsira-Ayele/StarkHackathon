import axios from "axios";

// Base URL for the backend API.
// During local development this points at the Express server on PORT 5000 (see .env).
// Update VITE_API_BASE_URL in a .env file at the frontend root once deployed to EthioDeploy.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * POST /api/campaigns
 * Creates a new campaign. Per the project plan, every new campaign is
 * created with status: 'pending' on the backend — it will NOT appear
 * in the public feed until an admin approves it.
 *
 * @param {Object} campaignData - { title, story, goalAmount, category, creatorName, imageUrl }
 * @returns {Promise<Object>} the created campaign object (status: 'pending')
 */
export const createCampaign = async (campaignData) => {
  const response = await api.post("/campaigns", campaignData);
  return response.data;
};

/**
 * GET /api/campaigns
 * Returns only approved campaigns, per the API contract.
 *
 * @returns {Promise<Array>} array of approved campaign objects
 */
export const getCampaigns = async () => {
  const response = await api.get("/campaigns");
  return response.data;
};

/**
 * GET /api/campaigns/:id
 * Returns a single campaign by its ID.
 *
 * @param {string} id - campaign ID
 * @returns {Promise<Object>} single campaign object
 */
export const getCampaignById = async (id) => {
  const response = await api.get(`/campaigns/${id}`);
  return response.data;
};

/**
 * POST /api/campaigns/:id/donate
 * Submits a donation to a specific campaign.
 *
 * IMPORTANT: The backend verifies payment via Links.et before marking
 * paymentStatus as 'completed'. This function only submits the request
 * and returns whatever the backend responds with (which may be
 * 'pending', 'completed', or 'failed'). The frontend must NEVER assume
 * a donation succeeded just because this request resolved.
 *
 * @param {string} campaignId - the campaign being donated to
 * @param {Object} donationData - { amount, donorName, message }
 * @returns {Promise<Object>} { campaign, donation } as returned by the backend
 */
export const donateToCampaign = async (campaignId, donationData) => {
  const response = await api.post(`/campaigns/${campaignId}/donate`, donationData);
  return response.data;
};

export default api;