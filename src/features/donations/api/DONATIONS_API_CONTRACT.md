# Member 4 — Donations + Support Flow API Contract

This document outlines the API contracts for **Member 4 (Donations + Support Flow)** in Lewegene Ethiopian Crowdfunding Platform, adhering to the frontend-to-backend guide.

---

## 1. Get Banks

### Purpose
Retrieve the list of supported Ethiopian banks, mobile money rails (e.g. Telebirr, CBE Birr), receiving account numbers, and transfer instructions for donors.

### Method
`GET`

### Endpoint
`/api/banks`

### Authentication
Not required (Public)

### Query Parameters
None

### Request Body
None

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "bank_cbe",
      "code": "CBE",
      "name": {
        "en": "Commercial Bank of Ethiopia (CBE)",
        "am": "የኢትዮጵያ ንግድ ባንክ (CBE)",
        "om": "Baankii Daldala Itoophiyaa (CBE)"
      },
      "shortName": "CBE",
      "accountNumber": "1000284920194",
      "accountName": "Lewegene Civic Solidarity / Community Escrow",
      "branch": "Addis Ababa Central Branch",
      "swiftCode": "CBETETAA",
      "logoText": "CBE",
      "badge": "State Escrow & Largest Network",
      "isPopular": true,
      "color": "#800080",
      "instructions": {
        "en": [
          "Open your CBE Mobile Banking App or dial *847#",
          "Select 'Transfer' → 'Transfer to CBE Account'",
          "Enter Account Number: 1000284920194",
          "Verify receiver: 'Lewegene Civic Solidarity'",
          "Complete transfer and copy the Transaction ID (FT...) to enter below"
        ],
        "am": [
          "የሲቢኢ ሞባይል ባንኪንግ መተግበሪያን ይክፈቱ ወይም *847# ይደውሉ",
          "«ገንዘብ ማስተላለፍ» → «ወደ ሲቢኢ ሂሳብ» የሚለውን ይምረጡ",
          "የሂሳብ ቁጥር: 1000284920194 ያስገቡ",
          "ተቀባይ «Lewegene Civic Solidarity» መሆኑን ያረጋግጡ",
          "ክፍያውን ፈፅመው የግብይት ማረጋገጫ ቁጥሩን (FT...) ከታች ያስገቡ"
        ],
        "om": [
          "Appii Baankii Moobaayilaa CBE banaa yookiin *847# bilbilaa",
          "\"Dabarsa\" → \"Gara herrega CBEtti\" filadhaa",
          "Lakkoofsa Herregaa: 1000284920194 galchaa",
          "Maqaan simataa \"Lewegene Civic Solidarity\" ta’uu mirkaneeffadhaa",
          "Kaffaltii raawwadhaa lakkoofsa mirkaneessaa (FT...) asitti galchaa"
        ]
      }
    }
  ]
}
```

### Possible Errors
- `500` - Internal server error

---

## 2. Create Donation

### Purpose
Creates an initial donation record when the donor selects the cause, amount, and bank, before external payment is made.

### Method
`POST`

### Endpoint
`/api/donations`

### Authentication
Optional / Authenticated if user is logged in

### Request Body
```json
{
  "campaignId": "camp-101",
  "amount": 2500,
  "donorName": "Almaz Bekele",
  "donorEmail": "almaz@example.com",
  "donorPhone": "+251911223344",
  "anonymous": false,
  "bankId": "bank_cbe",
  "message": "Wishing speedy recovery to Bethlehem!"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "don-1743440000000",
    "campaignId": "camp-101",
    "campaignTitle": "Urgent Pediatric Heart Surgery for Bethlehem",
    "beneficiaryName": "Tikur Anbessa Pediatric Health Trust",
    "amount": 2500,
    "donorName": "Almaz Bekele",
    "donorEmail": "almaz@example.com",
    "anonymous": false,
    "message": "Wishing speedy recovery to Bethlehem!",
    "bankId": "bank_cbe",
    "bankName": "Commercial Bank of Ethiopia (CBE)",
    "accountNumber": "1000284920194",
    "status": "pending",
    "createdAt": "2026-03-30T16:30:00.000Z"
  }
}
```

### Business Rules (Backend Owned)
- Initial status is always `pending`.
- `raisedAmount` calculation is managed authoritatively by backend once admin confirms or verifies.

### Possible Errors
- `400` - Invalid input (amount < 50, missing campaignId or bankId)
- `404` - Campaign or Bank not found
- `500` - Internal server error

---

## 3. Submit Payment Reference

### Purpose
Submits the external bank transaction reference code (e.g., `FT2608...` or `TB...`) and optional screenshot proof after the donor executes the transfer in their banking application.

### Method
`POST`

### Endpoint
`/api/donations/:donationId/reference`

### Authentication
Optional / Matches creator

### Parameters
- `donationId: string`

### Request Body
```json
{
  "reference": "FT2608492019",
  "proofUrl": "https://storage.googleapis.com/.../receipt.png"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "don-1743440000000",
    "reference": "FT2608492019",
    "proofUrl": "https://storage.googleapis.com/.../receipt.png",
    "status": "pending",
    "certificateId": "LW-ETB-849201",
    "updatedAt": "2026-03-30T16:35:00.000Z"
  }
}
```

### Business Rules
- Status remains `pending` until verified by an Admin (Member 5).
- Generates a commemorative certificate reference code `LW-ETB-XXXXXX`.

### Possible Errors
- `400` - Reference string missing or too short
- `404` - Donation record not found
- `500` - Server error

---

## 4. Get Donation Details

### Purpose
Fetches full details of a specific donation record for the printable receipt modal and confirmation view.

### Method
`GET`

### Endpoint
`/api/donations/:donationId`

### Authentication
Not required / Public or authenticated

### Parameters
- `donationId: string`

### Response
```json
{
  "success": true,
  "data": {
    "id": "don-1743440000000",
    "campaignId": "camp-101",
    "campaignTitle": "Urgent Pediatric Heart Surgery for Bethlehem",
    "beneficiaryName": "Tikur Anbessa Pediatric Health Trust",
    "amount": 2500,
    "donorName": "Almaz Bekele",
    "donorEmail": "almaz@example.com",
    "anonymous": false,
    "bankId": "bank_cbe",
    "bankName": "Commercial Bank of Ethiopia",
    "accountNumber": "1000284920194",
    "reference": "FT2608492019",
    "status": "confirmed",
    "createdAt": "2026-03-30T16:30:00.000Z",
    "verifiedAt": "2026-03-30T17:00:00.000Z",
    "certificateId": "LW-ETB-849201"
  }
}
```

### Possible Errors
- `404` - Donation not found
- `500` - Server error

---

## 5. Get My Contributions

### Purpose
Retrieves the logged-in patron's donation history, total underwritten amount, and verification status summary for the "My Contributions" page.

### Method
`GET`

### Endpoint
`/api/users/me/donations`

### Authentication
Required (`Bearer <token>`)

### Query Parameters
- `status?: 'all' | 'confirmed' | 'pending'`
- `page?: number`
- `limit?: number`

### Response
```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "id": "don-1001",
        "campaignId": "camp-101",
        "campaignTitle": "Urgent Pediatric Heart Surgery for Bethlehem",
        "beneficiaryName": "Bethlehem (Tikur Anbessa)",
        "amount": 2500,
        "donorName": "Dr. Yosef Hailu",
        "anonymous": false,
        "bankId": "bank_cbe",
        "bankName": "Commercial Bank of Ethiopia",
        "accountNumber": "1000284920194",
        "reference": "FT260849214",
        "status": "confirmed",
        "createdAt": "2026-03-24T14:32:00Z",
        "verifiedAt": "2026-03-24T16:00:00Z",
        "certificateId": "LW-ETB-849201"
      }
    ],
    "stats": {
      "totalAmount": 9000,
      "totalDonationsCount": 4,
      "causesSupportedCount": 3,
      "confirmedCount": 3,
      "pendingCount": 1,
      "largestDonation": 5000
    }
  }
}
```

### Possible Errors
- `401` - Unauthorized
- `500` - Server error
