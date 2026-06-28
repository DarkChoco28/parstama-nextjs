<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Login Issue Fixed (28 Jun 2026)

### Root Cause
1. **Vercel Postgres integration** was auto-populating `DATABASE_URL` to a different database (not Neon)
2. **`NEXTAUTH_URL`** was hardcoded to `parstama.duckdns.org` — caused CSRF mismatch when accessing via `www.parstama.duckdns.org`
3. **Admin user** didn't exist in the database that Vercel was connecting to (Vercel was on Postgres, user seeded on Neon)

### Fix Applied
- Updated `DATABASE_URL` in Vercel env vars (project `parstama-nextjs`) to point to Neon
- Removed `NEXTAUTH_URL` from Vercel env vars — NextAuth auto-detects
- Removed `NEXTAUTH_URL` from `.env.production`
- Injected admin user `admin@parstama.id` / `admin123` directly to Neon DB
- Also added `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `BREVO_SMTP_KEY` to Vercel env vars

### Verifikasi Login
Login berhasil di `https://www.parstama.duckdns.org` via:
- Email: `admin@parstama.id`
- Password: `admin123`

### Deploy Note
Vercel CLI sekarang terlink ke project **parstama-nextjs** (domain `parstama.duckdns.org`). Untuk deploy ulang:
```
npx vercel deploy --prod --scope darkchoco28s-projects --token <token>
```
