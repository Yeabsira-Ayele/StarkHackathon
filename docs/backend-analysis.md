# Lewegene Backend Analysis

This document compares the workflow in the Lewegene product guide with the current backend implementation in this project.

## 1. Current backend structure

### Technology and framework

- Runtime: Node.js
- Web server: Express.js
- Database: MongoDB
- ODM: Mongoose
- Auth approach: very basic custom header-based admin access (`x-admin-key`)
- Architecture: simple MVC-style structure

### Main folders and files

#### `server.js`

This is the main app bootstrap file.

Responsibilities:
- Starts the Express server
- Reads environment variables with `dotenv`
- Connects to MongoDB
- Registers routes
- Adds JSON parsing middleware and CORS
- Handles health check and error responses

Important behavior:
- `GET /` returns a basic health-check message
- It loads the route groups for campaigns, donations, and admin
- It handles 404 and global error responses

#### `src/config/db.js`

This file connects the app to MongoDB using `MONGO_URI` from the environment.

Responsibilities:
- Reads `MONGO_URI`
- Calls `mongoose.connect(uri)`
- Exits the process if the database config is missing

#### `src/models/Campaign.js`

Defines the `Campaign` Mongo model.

Current fields:
- `title`
- `story`
- `goalAmount`
- `raisedAmount`
- `creatorName`
- `category`
- `imageUrl`
- `status`
- `createdAt`

Current status values:
- `pending`
- `approved`
- `rejected`

This model is a minimal campaign model; it does not yet cover:
- user ownership
- organization ownership
- beneficiary info
- receiver info
- verification documents
- draft state
- public/private lifecycle

#### `src/models/Donation.js`

Defines the `Donation` model.

Current fields:
- `campaignId`
- `amount`
- `donorName`
- `message`
- `paymentStatus`
- `provider`
- `receiptKey`
- `createdAt`

This is designed to support receipt-based payment verification through `links.et`.

#### `src/controllers/campaignController.js`

This file contains the business logic for campaigns.

It handles:
- listing campaigns
- getting one campaign by ID
- creating a campaign
- updating campaign data
- deleting a campaign

It includes:
- status filtering (`approved` campaigns only on public list)
- category validation
- search by title
- sort options
- pagination
- progress percentage calculation
- validation for title, story, goal amount, category

#### `src/controllers/donationController.js`

This file contains donation logic.

It handles:
- listing completed donations for a campaign
- verifying a payment receipt URL
- creating a donation record when verification succeeds
- updating campaign `raisedAmount`

It uses `src/services/LinkEt.js` for bank receipt verification.

#### `src/controllers/adminController.js`

This file handles admin moderation.

It currently supports:
- listing pending campaigns
- approving or rejecting campaigns

#### `src/routes/CampaignRoutes.js`

Defines routes for campaigns.

Current routes:
- `GET /api/campaigns`
- `GET /api/campaigns/:id`
- `POST /api/campaigns`
- `PATCH /api/campaigns/:id` (admin-only)
- `DELETE /api/campaigns/:id` (admin-only)

#### `src/routes/donationRoutes.js`

Defines donation routes.

Current routes:
- `GET /api/donations/:campaignId`
- `POST /api/donations/:campaignId`

#### `src/routes/adminRoutes.js`

Defines admin-only routes.

Current routes:
- `GET /api/admin/campaigns`
- `PATCH /api/admin/campaigns/:id`

#### `src/middleware/adminAuth.js`

Very simple custom admin authentication.

Behavior:
- checks for `x-admin-key` header
- compares with `ADMIN_KEY` from environment
- returns 401 or 503 if invalid or missing

This is not a real role-based auth system.

#### `src/middleware/rateLimits.js`

Adds basic rate limiting to protect endpoints.

Current limits:
- campaign creation: 20 per hour
- donation submission: 10 every 15 minutes

#### `src/services/LinkEt.js`

This service verifies donation receipts using `links.et`.

Responsibilities:
- validate supported receipt URL hosts
- call external verification API
- read the payment amount from the receipt
- ensure transaction status is completed
- ensure receiver name matches expected account
- prevent duplicate payments using a unique `receiptKey`

#### `docs/API.md`

This file documents the current API contract and expected behavior.

It helps describe how the backend is meant to behave, but it is not the final full product workflow.

## 2. Database

### Current database structure

The project currently uses two models:

#### `Campaign`

Fields:
- `_id`
- `title`
- `story`
- `goalAmount`
- `raisedAmount`
- `creatorName`
- `category`
- `imageUrl`
- `status`
- `createdAt`

#### `Donation`

Fields:
- `_id`
- `campaignId`
- `amount`
- `donorName`
- `message`
- `paymentStatus`
- `provider`
- `receiptKey`
- `createdAt`

### Relationship between them

- One `Campaign` can have many `Donation` records
- Each `Donation` points to one campaign through `campaignId`

This is a classic one-to-many relation:
- `Campaign` = cause/fundraiser
- `Donation` = money received for that cause

### Current limitations of the database

The current backend has no models for:
- users
- organizations
- admin users
- reports
- notifications
- payment verification records
- fundraiser drafts
- documents / proof uploads
- beneficiary / receiver information
- activity logs

### Additional tables/models/fields needed by the workflow

The workflow described in the product guide is much broader than the code currently supports.

#### Users

Need a `User` model with fields like:
- `name`
- `email`
- `passwordHash`
- `phone`
- `profilePhoto`
- `role`
- `accountType`
- `status`
- `createdAt`

#### Organizations

Need an `Organization` model with fields like:
- `userId`
- `name`
- `officialEmail`
- `phone`
- `organizationType`
- `location`
- `description`
- `logo`
- `verificationDocuments`
- `authorizedRepresentative`
- `bankAccount`
- `verificationStatus`
- `reviewNotes`
- `createdAt`

#### Fundraisers / campaigns (expanded)

The project currently stores a small campaign object. The workflow requires a richer fundraiser model.

Fields likely required:
- `ownerUserId`
- `organizationId` (optional)
- `title`
- `story`
- `category`
- `location`
- `targetAmount`
- `raisedAmount`
- `currency`
- `status`
- `isPublic`
- `coverImage`
- `galleryImages`
- `creatorDetails`
- `beneficiaryDetails`
- `receivingAccount`
- `supportingDocuments`
- `deadline`
- `createdAt`
- `updatedAt`
- `publishedAt`
- `reviewedByAdminId`

#### Beneficiary model

Need a structure to separate:
- creator
- beneficiary
- receiver account

Example fields:
- `fundraiserId`
- `name`
- `relationToCreator`
- `phone`
- `contactInfo`
- `bankInfo`
- `verificationDocuments`

#### Reports

Need a `Report` model:
- `reporterUserId`
- `fundraiserId`
- `category`
- `details`
- `evidence`
- `status`
- `reviewedByAdminId`
- `createdAt`

#### Donations (expanded)

The current donation schema is basic, but the workflow needs more precise donation management.

Add fields like:
- `donorUserId` (optional)
- `fundraiserId`
- `amount`
- `currency`
- `donorName`
- `donorEmail`
- `anonymous`
- `message`
- `bankName`
- `paymentReference`
- `provider`
- `verificationStatus`
- `adminVerifiedAt`
- `createdAt`

#### Notifications

Add `Notification` model:
- `userId` or `adminId`
- `type`
- `title`
- `message`
- `readAt`
- `createdAt`

#### Activity log

Add `AdminActivity` or `ActivityLog` model:
- `adminId`
- `action`
- `entityType`
- `entityId`
- `details`
- `createdAt`

#### Drafts

A draft model is needed for saving fundraiser drafts privately.

Fields:
- `ownerUserId`
- `payload`
- `lastUpdatedAt`
- `status`

## 3. API endpoints

### Existing endpoints

#### `GET /`

Purpose:
- health check

Auth:
- none

Response:
- `200` with a status message

#### `GET /api/campaigns`

Purpose:
- list public approved campaigns

Query parameters:
- `category`
- `search`
- `sort`
- `page`
- `limit`

Auth:
- public

Response:
- campaigns with `progress` included
- pagination info

#### `GET /api/campaigns/:id`

Purpose:
- get a specific campaign

Auth:
- public

Response:
- campaign object with progress info

#### `POST /api/campaigns`

Purpose:
- create a campaign

Request body:
- `title`
- `story`
- `goalAmount`
- `creatorName` (optional)
- `category` (optional)
- `imageUrl` (optional)

Auth:
- public in current code

Response:
- created campaign object

#### `PATCH /api/campaigns/:id`

Purpose:
- update a campaign

Auth:
- admin-only via `x-admin-key`

Response:
- updated campaign

#### `DELETE /api/campaigns/:id`

Purpose:
- delete a campaign if no donations have been received

Auth:
- admin-only via `x-admin-key`

#### `GET /api/donations/:campaignId`

Purpose:
- list donations for a campaign

Auth:
- public

Response:
- donation list + pagination

#### `POST /api/donations/:campaignId`

Purpose:
- verify a payment receipt and record the donation

Request body:
- `receiptUrl`
- `donorName` (optional)
- `message` (optional)

Auth:
- public but rate-limited

Response:
- success message and donation object

#### `GET /api/admin/campaigns`

Purpose:
- list pending campaigns for review

Auth:
- admin-only

#### `PATCH /api/admin/campaigns/:id`

Purpose:
- approve or reject a campaign

Auth:
- admin-only

Request body:
- `{ status: "approved" }` or `{ status: "rejected" }`

### New endpoints required by the workflow

#### Authentication endpoints

##### `POST /api/auth/google`

Purpose:
- verify a Google Identity Services ID token and sign in, creating a user account on first sign-in

Auth:
- Google credential in the request body; backend verifies the token against `GOOGLE_CLIENT_ID`

Request data:
- `credential` (Google ID token; email must be verified)

Response:
- API token + user profile

##### `GET /api/auth/me`

Purpose:
- retrieve currently logged-in user

Auth:
- required

##### `POST /api/auth/logout`

Purpose:
- log user out

Auth:
- required

#### Organization endpoints

##### `POST /api/organizations/apply`

Purpose:
- submit organization verification application

Auth:
- logged-in user

Request data:
- name
- email
- phone
- org type
- location
- description
- logo
- documents
- authorized rep info
- bank info

Response:
- application record with pending status

##### `GET /api/admin/organizations`

Purpose:
- list organization applications

Auth:
- admin-only

##### `PATCH /api/admin/organizations/:id`

Purpose:
- approve/reject/request changes for organization

Auth:
- admin-only

#### Fundraiser endpoints

##### `POST /api/fundraisers`

Purpose:
- create fundraiser

Auth:
- logged-in user

Request data:
- title
- category
- story
- target amount
- location
- creator info
- beneficiary info
- receiving account info
- images
- supporting docs

Response:
- created fundraiser in draft or pending state

##### `GET /api/fundraisers`

Purpose:
- public browsing of approved campaign/fundraisers

Auth:
- public

Response:
- list of published fundraisers

##### `GET /api/fundraisers/:id`

Purpose:
- view detailed fundraiser

Auth:
- public for approved content

##### `PATCH /api/fundraisers/:id`

Purpose:
- edit a fundraiser

Auth:
- owner or admin

##### `DELETE /api/fundraisers/:id`

Purpose:
- delete fundraiser

Auth:
- owner or admin

##### `POST /api/fundraisers/:id/submit`

Purpose:
- submit draft or edited fundraiser for review

Auth:
- owner

##### `GET /api/users/me/fundraisers`

Purpose:
- view user’s own fundraiser list

Auth:
- logged-in user

#### Draft endpoints

##### `POST /api/fundraisers/drafts`

Purpose:
- save a fundraiser as draft

Auth:
- logged-in user

##### `GET /api/fundraisers/drafts`

Purpose:
- list saved drafts

Auth:
- logged-in user

##### `PATCH /api/fundraisers/drafts/:id`

Purpose:
- edit draft

Auth:
- owner

#### Donation endpoints

##### `POST /api/donations`

Purpose:
- create a donation record with amount, donor, and bank reference

Auth:
- public or logged-in depending on product decision

Request data:
- fundraiserId
- amount
- donor name/email
- anonymous flag
- bank name
- reference
- payment proof

Response:
- donation record with pending or pending-verification status

##### `GET /api/users/me/donations`

Purpose:
- view donor history

Auth:
- logged-in user

##### `GET /api/admin/donations`

Purpose:
- list donations pending admin verification

Auth:
- admin-only

##### `PATCH /api/admin/donations/:id/verify`

Purpose:
- confirm or reject donation

Auth:
- admin-only

#### Report endpoints

##### `POST /api/reports`

Purpose:
- submit a report on a campaign/fundraiser

Auth:
- logged-in user

##### `GET /api/reports/me`

Purpose:
- view my reports

Auth:
- logged-in user

##### `GET /api/admin/reports`

Purpose:
- list reports for review

Auth:
- admin-only

##### `PATCH /api/admin/reports/:id`

Purpose:
- resolve or dismiss a report

Auth:
- admin-only

#### Notification endpoints

##### `GET /api/notifications`

Purpose:
- list notifications for current user/admin

Auth:
- required

##### `PATCH /api/notifications/:id/read`

Purpose:
- mark a notification as read

Auth:
- required

#### Admin dashboard endpoints

##### `GET /api/admin/dashboard`

Purpose:
- get summary metrics

Auth:
- admin-only

##### `GET /api/admin/activity`

Purpose:
- view recent actions

Auth:
- admin-only

## 4. User roles and permissions

### Guest / anonymous visitor

Can:
- browse public campaigns
- view public fundraiser pages
- maybe donate without account if the product allows it

Cannot:
- create fundraising campaign
- submit reports without login
- access private personal dashboard
- manage admin functions

### Individual user

Can:
- sign up/login
- browse causes
- donate
- report a campaign
- create own fundraiser
- manage own fundraiser drafts
- view own contributions
- view own reports
- edit own profile

Cannot:
- approve campaigns
- verify donor transactions
- access admin dashboard
- manage other users’ campaigns or reports

### Organization / charity account

Can:
- apply for organization verification
- after approval, create and manage multiple causes/fundraisers
- publish organization profile
- view their own organization dashboard

Cannot:
- access admin tools
- approve or reject others’ campaigns without admin role
- bypass verification rules

### Admin

Can:
- review campaign submissions
- approve/reject campaigns
- review organization applications
- verify donations
- resolve reports
- manage activity logs
- manage admin accounts

Cannot:
- use the application as a normal donor without proper end-user permissions
- ignore moderation rules

### Authorization requirements

The current backend uses a simple custom header check. That is not enough for the workflow.

The backend needs:
- JWT or session-based auth
- roles in the user record
- ownership checks
- admin-only guard middleware
- owner-or-admin middleware
- request validation by role

## 5. Complete workflow mapping

This is the product workflow mapped to backend logic.

### Example flow: user signs up

User action:
- click "Continue with Google"

Frontend:
- sends the Google Identity Services ID token

API:
- `POST /api/auth/google`

Backend logic:
- verify token signature, audience, and verified email
- link an existing account with the same email or create a user record
- create API token

Database operation:
- find or insert `User` record

Response:
- return token + user object

Frontend result:
- user is logged in and sees their account area

### Example flow: organization application

User action:
- submit organization application

Frontend:
- sends organization details and documents

API:
- `POST /api/organizations/apply`

Backend logic:
- validate required fields
- save organization application
- attach `pending` status
- store supporting documents

Database operation:
- create `Organization` application record

Response:
- success status + application id

Frontend result:
- user sees “application submitted”

### Example flow: create fundraiser

User action:
- create fundraiser form

Frontend:
- sends fundraiser data

API:
- `POST /api/fundraisers` or `POST /api/fundraisers/drafts`

Backend logic:
- verify logged-in user
- validate fields
- attach owner info
- save fundraiser as draft or pending review

Database operation:
- insert fundraiser object

Response:
- created fundraiser record

Frontend result:
- user sees fundraiser saved or submitted

### Example flow: admin approval

User action:
- admin clicks Approve or Reject

Frontend:
- calls `PATCH /api/admin/fundraisers/:id`

Backend logic:
- verify admin role
- validate status change
- update fundraiser status
- generate activity log
- maybe trigger notification

Database operation:
- update fundraiser record
- insert activity log

Response:
- updated fundraiser object

Frontend result:
- fundraiser becomes active/public or rejected

### Example flow: donation

User action:
- chooses campaign and makes donation

Frontend:
- collects amount, donor info, bank/payment info
- submits donation request

API:
- `POST /api/donations` or `POST /api/donations/:campaignId`

Backend logic:
- validate fundraiser is approved and active
- validate amount and donor details
- save donation with pending status
- call receipt verification service
- confirm payment,
- update fundraiser total

Database operation:
- insert donation record
- increment `raisedAmount`

Response:
- donation confirmation

Frontend result:
- user sees donation success and campaign progress updates

## 6. Campaign workflow

### Creating a campaign

Current backend code supports a minimal version:
- `POST /api/campaigns`
- title, story, goal amount, creator name, category, image URL

That matches only a very basic MVP.

The workflow requires more:
- owner user or organization
- beneficiary information
- receiver account information
- supporting documents
- public/private state
- status workflow

### Uploading/handling campaign images

Current backend:
- only supports a single `imageUrl` string
- no actual file upload
- no storage strategy

Workflow requires:
- hero image
- gallery images
- image validation
- cloud storage
- image deletion/update support

Backend design:
- `POST /api/uploads` or upload via fundraiser endpoint
- store file in cloud storage
- save returned URL in database

### Editing a campaign

Current backend:
- `PATCH /api/campaigns/:id`
- only allows some fields
- admin-only in current implementation

Workflow requires:
- owner edits own fundraiser
- admin can request changes or approve edits
- change reason required in many products
- updated status may be `needs_changes` or pending review again

### Submitting/publishing a campaign

Current backend:
- create campaign with status pending
- admin review approves/rejects it

Workflow requires:
- save as draft
- submit for review
- publish only after approval
- public/private distinction

### Browsing campaigns

Current backend supports:
- list approved campaigns
- category filter
- search by title
- sort by newest / oldest / most funded
- pagination

Workflow adds more:
- urgency filters
- verified or unverified filters
- organization profile filters
- location filters
- archive status filters

### Viewing campaign details

Current backend supports one page summary only.

Workflow requires:
- story and campaign details
- progress metrics
- donor list
- share button
- report button
- owner info
- organization info
- verifying badge status

### Campaign status

Current backend has only:
- pending
- approved
- rejected

The workflow requires a richer lifecycle:
- draft
- pending review
- needs changes
- approved
- active
- completed
- rejected
- archived

### Campaign owner information

Current backend stores only `creatorName` as a string.

Workflow requires clear distinction between:
- creator
- beneficiary
- receiving account

Therefore backend should store structured owner data, not just one text field.

## 7. Donation workflow

### Selecting a campaign

Current backend usage:
- frontend selects a campaign ID
- then sends donation to `/api/donations/:campaignId`

This is workable, but the workflow expects a more complete donation path:
- choose amount
- choose bank
- send via bank transfer
- return with reference
- wait for verification

### Entering donation information

Current backend accepts:
- receipt URL
- donor name
- message

Workflow expects additional fields:
- amount
- donor email
- optional anonymous donation flag
- bank selection
- reference code
- payment proof metadata

### Submitting a donation

Current backend:
- donation submission triggers immediate verification through `links.et`

This is only a partial solution. The workflow likely expects a manual verification model:
- donation goes to pending verification
- admin verifies
- status becomes confirmed

### Payment/donation processing

Current backend does a good job of:
- validating URL host
- verifying payment amount and receiver name
- checking completeness of payment
- preventing duplicates
- updating fundraiser total

This is a strong foundation for donation verification.

But it does not yet cover:
- user balance/ledger tracking
- donor account checks
- admin verification queue
- donation rejection management

### Donation confirmation

Current backend confirms donation immediately when the receipt is verified.

The workflow likely expects:
- pending verification status
- admin confirmation
- final “confirmed” state

So the backend needs a separate admin verification stage.

### Updating campaign progress

Current backend updates campaign `raisedAmount` directly through MongoDB.

This is good for a simple MVP.

But the workflow needs:
- donation totals by campaign
- confirmation status before count is final
- donation audit trail
- progress values recalculated from confirmed donations only if the product demands it

### Donation history/records

Current backend has:
- `GET /api/donations/:campaignId`

That is good for public donor list.

The workflow also requires:
- user-specific donation history (`My Contributions`)
- total contributed by user
- donation status
- donation detail page
- recent contribution table

This requires a query by donor user ID, not only by campaign.

## 8. Additional features

### Authentication

Missing in current backend.

Needed:
- user signup
- user login
- password encryption
- JWT session handling
- Google login integration if required
- access tokens and refresh tokens

### Notifications

Current backend has no notification system.

Needed:
- in-app notifications
- email notifications
- trigger events for:
  - fundraiser approved
  - fundraiser rejected
  - changes requested
  - donation confirmed
  - report reviewed
  - organization result

### Verification

Current backend partially supports payment verification using `links.et`.

Missing from workflow:
- organization verification before profile approval
- fundraiser support document review
- beneficiary validation
- documentation checks

### Search/filtering

Current backend has only basic campaign search.

Needed:
- category
- location
- verified organizations
- urgent campaigns
- status filters
- sort by progress, end date, amount, etc.

### Comments / updates

The workflow mentions updates and likely some sort of donor engagement.

Current backend does not support:
- fundraiser updates
- public thank-you posts
- comments

### Dashboards

Current backend has only admin campaign moderation.

Needed:
- dashboard summary stats
- user dashboard
- organization dashboard
- admin dashboard with recent activity

### Admin functions

Current backend has a very thin admin layer.

Needed:
- approve/reject fundraisers
- review reports
- review donations
- manage organization applications
- view recent activity
- manage admins

## 9. Missing functionality

### Already implemented

- Express app setup
- MongoDB connection
- campaign model
- donation model
- public campaign list
- single campaign detail
- campaign creation
- donation receipt verification
- admin campaign approval/rejection
- rate limiting

### Partially implemented

- donation verification flow
- admin auth
- campaign moderation
- public progress calculation
- public donation list

### Completely missing

- user authentication
- user profiles
- organization applications
- organization verification
- fundraiser drafts
- fundraiser ownership control
- beneficiary/receiver models
- reports
- notifications
- dashboard APIs
- admin activity log
- media upload handling
- document approval workflow
- role-based authorization

### Needs clarification

- Is “campaign” and “fundraiser” the same concept in product design?
- Are guest donations allowed?
- Is Google authentication required in MVP?
- Are email notifications mandatory or optional?
- Is org approval required before user can create organization-funded campaigns?
- Should every donation be manually approved by admin or only some payment types?
- Are comments required in the first release?
- Are reports per fundraiser or general platform issues?

## 10. Recommended backend architecture

The current project is a good starting point, but to fully support the workflow the backend should be expanded into a more complete structure.

Recommended folder structure:

- `src/app.js` or keep `server.js`
- `src/config/`
  - `db.js`
  - `env.js`
  - `storage.js`
  - `email.js`
- `src/middleware/`
  - `auth.js`
  - `requireAuth.js`
  - `requireAdmin.js`
  - `requireOwnerOrAdmin.js`
  - `rateLimits.js`
  - `upload.js`
- `src/routes/`
  - `authRoutes.js`
  - `userRoutes.js`
  - `organizationRoutes.js`
  - `fundraiserRoutes.js`
  - `donationRoutes.js`
  - `reportRoutes.js`
  - `notificationRoutes.js`
  - `adminRoutes.js`
- `src/controllers/`
  - `authController.js`
  - `userController.js`
  - `organizationController.js`
  - `fundraiserController.js`
  - `donationController.js`
  - `reportController.js`
  - `notificationController.js`
  - `adminController.js`
- `src/models/`
  - `User.js`
  - `Organization.js`
  - `Fundraiser.js`
  - `Donation.js`
  - `Report.js`
  - `Notification.js`
  - `VerificationDocument.js`
  - `ActivityLog.js`
  - `Draft.js`
- `src/services/`
  - `authService.js`
  - `fundraiserService.js`
  - `donationService.js`
  - `verificationService.js`
  - `emailService.js`
  - `uploadService.js`
  - `adminService.js`
- `src/utils/`
  - `validation.js`
  - `statusHelpers.js`
  - `pagination.js`

### Recommended principles

1. Use real authentication
   - JWT or secure session tokens
   - password hashing
   - roles and permissions

2. Separate public and private APIs
   - public browsing endpoints
   - user-specific endpoints
   - admin-only endpoints

3. Add explicit content lifecycle statuses
   - do not force everything into one generic status field

4. Add audit logging
   - every admin change should be recorded

5. Add ownership checking
   - user can edit only their own fundraiser

6. Add consistent service-layer logic
   - verification, uploads, notifications, and moderation should not live inside controllers only

7. Keep the current payment verification strong
   - this is one of the best parts of the current codebase

## BACKEND IMPLEMENTATION CHECKLIST

### Authentication

- [x] Google sign-in and registration using verified Google email
- [x] Logout endpoint
- [x] JWT/session management
- [x] Current user profile endpoint

### User roles

- [ ] Guest user
- [ ] Individual user
- [ ] Organization user
- [ ] Admin user
- [ ] Permission middleware for each role

### Organization workflow

- [ ] Organization signup form data validation
- [ ] Organization application model
- [ ] Document upload support
- [ ] Organization verification status
- [ ] Admin approval/rejection flow
- [ ] Organization profile creation

### Fundraiser workflow

- [ ] Fundraiser create endpoint
- [ ] Fundraiser draft save
- [ ] Fundraiser submit for review
- [ ] Campaign/fundraiser approval flow
- [ ] Request changes flow
- [ ] Rejection flow
- [ ] Public publish logic
- [ ] Edit fundraiser endpoint
- [ ] Delete fundraiser endpoint
- [ ] Fundraiser status lifecycle

### Campaign / fundraiser fields

- [ ] Title
- [ ] Story
- [ ] Category
- [ ] Location
- [ ] Goal amount
- [ ] Raised amount
- [ ] Creator info
- [ ] Beneficiary info
- [ ] Receiving account info
- [ ] Images
- [ ] Documents
- [ ] Public/private state
- [ ] Deadline
- [ ] Owner relationship
- [ ] Organization relationship

### Donation workflow

- [ ] Donation form submission
- [ ] Amount validation
- [ ] Donor info storage
- [ ] Anonymous donor option
- [ ] Payment reference data
- [ ] Receipt verification
- [ ] Duplicate receipt protection
- [ ] Donation verification status
- [ ] Donation confirmed state
- [ ] My contributions list
- [ ] Donation detail endpoint
- [ ] Raised amount update logic

### Reports

- [ ] Report create endpoint
- [ ] Report status lifecycle
- [ ] My reports endpoint
- [ ] Admin reports review endpoint
- [ ] Resolve/dismiss logic

### Notifications

- [ ] Notification model
- [ ] Create notification on key events
- [ ] Notification list endpoint
- [ ] Mark as read endpoint
- [ ] Email notifications if required

### Admin features

- [ ] Dashboard summary endpoint
- [ ] Pending fundraiser list
- [ ] Donation review queue
- [ ] Report review queue
- [ ] Organization review queue
- [ ] Recent activity log
- [ ] Admin action logging
- [ ] Admin account management (optional)

### Media and documents

- [ ] Cover image upload
- [ ] Gallery image upload
- [ ] Organization logo upload
- [ ] Document upload support
- [ ] File type validation
- [ ] File size validation
- [ ] Storage integration

### Search and filtering

- [ ] Search by title
- [ ] Category filtering
- [ ] Location filtering
- [ ] Sort options
- [ ] Pagination
- [ ] Featured/urgent filters
- [ ] Verified organization filter

### Audit and validation

- [ ] Prevent unapproved campaigns from receiving donations
- [ ] Prevent duplicate payment references
- [ ] Validate required fundraiser info
- [ ] Validate all user role access checks
- [ ] Store review history
- [ ] Keep draft records private

### Testing

- [ ] Route tests for auth
- [ ] Route tests for fundraiser flows
- [ ] Route tests for donation verification
- [ ] Route tests for admin approvals
- [ ] Validation tests for all business rules

## Final summary

The current backend is a solid early-stage MVP. It already has the basics for:
- Express + MongoDB
- campaign listing and creation
- donation receipt verification
- admin review of campaigns

But it is not yet a full backend for the Lewegene workflow described in the product guide.

To fully support the actual product, the backend needs major additions around:
- user accounts and auth
- organizations
- fundraiser lifecycle and drafts
- detailed fundraiser data
- donation verification and admin approval
- reports
- notifications
- dashboards
- role-based permissions
- audit logging

This project has a good foundation, but it still needs a more complete backend architecture to match the actual workflow.
