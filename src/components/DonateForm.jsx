import { useState } from "react";
import { donateToCampaign } from "../api/campaignApi";

/**
 * DonateForm
 *
 * Props:
 * - campaignId (string, required): the campaign being donated to
 * - onDonationComplete (function, optional): called with the backend
 *   response after a donation request finishes, so a parent page
 *   (e.g. CampaignDetail) can refresh the progress bar/raisedAmount
 *
 * This form does NOT assume a donation succeeded just because the
 * request completed. The backend verifies payment via Links.et, so
 * the actual paymentStatus returned by the backend ('pending',
 * 'completed', or 'failed') is what gets shown to the user.
 */
function DonateForm({ campaignId, onDonationComplete }) {
  const initialFormState = {
    amount: "",
    donorName: "",
    message: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null); // { campaign, donation } from backend

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      return "Donation amount must be greater than 0.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setResult(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!campaignId) {
      setErrorMessage("Missing campaign ID — cannot submit donation.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        amount: Number(formData.amount),
      };

      if (formData.donorName.trim()) {
        payload.donorName = formData.donorName.trim();
      }
      if (formData.message.trim()) {
        payload.message = formData.message.trim();
      }

      const response = await donateToCampaign(campaignId, payload);

      // response is expected to be { campaign, donation } per the API contract.
      // donation.paymentStatus reflects the backend's verified result —
      // it may still be 'pending' at this point, not necessarily 'completed'.
      setResult(response);
      setFormData(initialFormState);

      if (onDonationComplete) {
        onDonationComplete(response);
      }
    } catch (error) {
      console.error("Failed to submit donation:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Something went wrong while submitting your donation. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusMessage = () => {
    if (!result?.donation) return null;

    const { paymentStatus } = result.donation;

    if (paymentStatus === "completed") {
      return (
        <div className="donation-status donation-status--completed">
          Thank you! Your donation has been verified and completed.
        </div>
      );
    }

    if (paymentStatus === "failed") {
      return (
        <div className="donation-status donation-status--failed">
          Your payment could not be verified. No funds were added to this
          campaign. Please try again.
        </div>
      );
    }

    // Default / 'pending' — payment verification with Links.et is still in progress
    return (
      <div className="donation-status donation-status--pending">
        Your donation has been submitted and is awaiting payment
        verification. This page will not show it as complete until it's
        confirmed.
      </div>
    );
  };

  if (result) {
    return (
      <div className="donate-form-result">
        {renderStatusMessage()}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setResult(null)}
        >
          Make another donation
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="donate-form">
      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <div className="form-group">
        <label htmlFor="amount">Amount (ETB) *</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          value={formData.amount}
          onChange={handleChange}
          placeholder="e.g. 500"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="donorName">Your Name (optional)</label>
        <input
          id="donorName"
          name="donorName"
          type="text"
          value={formData.donorName}
          onChange={handleChange}
          placeholder="Leave blank to stay Anonymous"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Message (optional)</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Leave a message of support"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Donate"}
      </button>
    </form>
  );
}

export default DonateForm;