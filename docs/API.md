# API Documentation — PARSTAMA

Base URL: `https://parstama.my.id`

## Public Endpoints

### POST /api/registrations
Submit a new member registration.

**Body:**
```json
{
  "fullName": "string (required)",
  "nickname": "string (optional)",
  "gender": "L | P (required)",
  "birthPlace": "string (required)",
  "birthDate": "string (required, ISO date)",
  "religion": "string (optional)",
  "address": "string (required)",
  "city": "string (optional)",
  "province": "string (optional)",
  "postalCode": "string (optional)",
  "whatsapp": "string (required, 10-20 digits)",
  "email": "string (optional, valid email)",
  "class": "string (required)",
  "major": "string (required)",
  "bloodType": "string (optional)",
  "medicalHistory": "string (optional)",
  "organizationExperience": "string (optional)",
  "motivation": "string (required, min 20 chars)",
  "parentConsent": "boolean (required, must be true)"
}
```

**Rate limit:** 5 requests/hour per IP.

### POST /api/chat
Send a message to the AI Assistant.

**Body:** `{ "message": "string (required)" }`

**Rate limit:** 20 requests/minute per IP.

### GET /api/articles
List published articles.

**Query params:** `page`, `limit`, `category`, `search`

### GET /api/articles/[slug]
Get a single published article.

### GET /api/articles/[slug]/comments
Get approved comments for an article.

### POST /api/articles/[slug]/comments
Submit a comment (pending approval).

**Body:** `{ "name": "string", "content": "string (3-1000 chars)" }`

**Rate limit:** 5 requests/hour per IP.

### GET /api/events
List events.

### POST /api/events/[id]/rsvp
RSVP to an event.

**Body:** `{ "name": "string", "whatsapp": "string", "email": "string (optional)" }`

**Rate limit:** 3 requests/hour per IP.

### GET /api/health
Health check. Returns `{ status, timestamp, uptime, checks }`.

## Auth Endpoints

### POST /api/auth/password-reset
Request a password reset link.

**Body:** `{ "email": "string" }`

**Rate limit:** 3 requests/hour per IP.

### POST /api/auth/password-reset/confirm
Reset password with token.

**Body:** `{ "token": "string", "password": "string (min 6 chars)" }`

## Admin Endpoints

All admin endpoints require authentication via `requireAdmin()` (NextAuth session).

### GET /api/admin/stats
Registration statistics summary.

### GET /api/admin/analytics
Detailed analytics: daily data, major distribution, status breakdown.

### GET /api/admin/registrations
List registrations with pagination and filters.

**Query params:** `page`, `limit`, `status`, `search`, `class`, `major`, `gender`, `startDate`, `endDate`

### PUT /api/admin/registrations/[id]
Update registration status.

**Body:** `{ "status": "pending | accepted | rejected" }`

### DELETE /api/admin/registrations/[id]
Delete a registration.

### POST /api/admin/register
Create a new admin account.

### PUT /api/admin/profile
Update admin profile.

### GET /api/admin/comments
List all comments (including pending).

### PUT /api/admin/comments
Approve or reject a comment.

**Body:** `{ "id": "string", "isApproved": true | false }`

### DELETE /api/admin/comments
Delete a comment.

**Body:** `{ "id": "string" }`

### POST /api/admin/notifications/email
Send status email to registrant.

### GET /api/admin/notifications/whatsapp
Generate WhatsApp notification link.

### POST /api/admin/articles
Create an article.

### PUT /api/admin/articles/[id]
Update an article.

### DELETE /api/admin/articles/[id]
Delete an article.

### POST /api/admin/events
Create an event.

### PUT /api/admin/events/[id]
Update an event.

### DELETE /api/admin/events/[id]
Delete an event.

### GET /api/admin/export/backup
Download full JSON backup (registrations, articles, events, members, settings).

### GET /api/admin/export/excel
Export registrations as Excel.

### GET /api/admin/export/pdf
Export registrations as PDF.

### POST /api/admin/rag/reindex
Trigger RAG knowledge base reindex.

### PUT /api/admin/settings/registration-open
Toggle registration open/closed.

**Body:** `{ "value": "0 | 1" }`
