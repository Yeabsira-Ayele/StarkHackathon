# Donation API contract

Donation account details are saved with the fundraiser and returned only by the
campaign-specific endpoint. The frontend must not use a global/default account
number or invent a receipt URL.

## Read fundraiser payout accounts

`GET /api/campaigns/:campaignId/donation-accounts` is public for pending and
approved campaigns.

```json
{
  "accounts": [
    {
      "bankId": "saved-bank-id",
      "bankName": "Saved bank name",
      "accountNumber": "account number saved by the fundraiser",
      "accountName": "saved account holder"
    }
  ]
}
```

The endpoint returns an empty `accounts` array when no valid receiving account
was saved. Public campaign list/detail payloads do not include payout details.

## Create a pending donation

`POST /api/donations/drafts`

```json
{
  "campaignId": "campaign id",
  "amount": 500,
  "donorName": "Donor name",
  "anonymous": false,
  "bankId": "bankId from the campaign account response",
  "message": "Optional message"
}
```

The backend requires a valid account saved for this campaign and returns a
pending donation draft.

## Verify a completed transfer

`POST /api/donations/records/:donationId/verify`

```json
{
  "receiptUrl": "actual receipt URL issued by the payment provider"
}
```

The server validates the receipt host, checks the amount and campaign account
holder, prevents duplicate receipt use, and only then records the contribution
and issues a certificate. Verification errors are returned to the client; the
frontend must keep the donation pending until verification succeeds.
