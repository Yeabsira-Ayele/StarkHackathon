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

## Submit and verify a donation

`POST /api/donations/:campaignId`

```json
{
  "amount": 500,
  "receiptUrl": "actual receipt URL issued by the payment provider",
  "donorName": "Donor name",
  "donorEmail": "optional email",
  "anonymous": false,
  "bankId": "bankId from the campaign account response",
  "message": "Optional message"
}
```

The backend validates the campaign account and receipt URL, asks Links.et to
verify the receipt, and checks the selected provider, recipient name, recipient
account number, and amount before saving. A successful transfer creates a
completed donation and certificate and updates campaign totals in one MongoDB
transaction. A receipt rejection, recipient/provider mismatch, or amount
mismatch creates no donation record.
Admin approval is not part of the payment flow. There are no donation draft or
separate receipt-verification endpoints.
