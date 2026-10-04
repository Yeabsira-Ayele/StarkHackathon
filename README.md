# Lewegene backend — Person 3

Donations, payments, search, and reports on branch `backend/donations`.

The public donor list is `GET /api/donations/campaign/:campaignId`. It is not mounted on `/api/campaigns`, because that router belongs to Person 2.

Request and response examples, stubs to delete on merge, and the service functions Person 2 and Person 4 should call are in [src/docs/PERSON3_API.md](src/docs/PERSON3_API.md).

```bash
npm install
npm run smoke:person3
```
