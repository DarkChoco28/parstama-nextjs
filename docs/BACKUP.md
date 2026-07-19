# Database Backup Strategy — PARSTAMA

## Automated Backups (Neon DB)

Neon provides **continuous backup** with point-in-time recovery on paid plans.

### What Neon handles automatically:
- **Continuous WAL archiving** — every transaction is archived
- **Point-in-time recovery** — restore to any moment within retention window
- **Branching** — create instant database copies for testing

### Retention by plan:
- **Free**: 24 hours
- **Launch**: 7 days
- **Scale**: 30 days
- **Business**: 30 days

## Application-Level Backup

### Automated JSON Export
Admin can download a full backup at any time:

```
GET /api/admin/export/backup
```

**Exports:** registrations, articles, events, organization members, settings

**File:** `parstama-backup-YYYY-MM-DD.json`

### Recommended backup schedule:
1. **Weekly** — download backup JSON via admin dashboard
2. **Before schema changes** — always backup before `prisma db push`
3. **Before major releases** — backup + test on staging

### Manual pg_dump (advanced)
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## Restore Procedure

### From JSON backup:
1. Go to admin panel → Import (or use Prisma seed script)
2. Parse JSON and upsert records by ID

### From pg_dump:
```bash
psql $DATABASE_URL < backup-20240101.sql
```

### From Neon branch:
1. Create a branch from a previous point-in-time
2. Update `DATABASE_URL` to point to the branch
3. Deploy

## Environment Variables to Protect

| Variable | Location | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Vercel env | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Vercel env | Session encryption key |
| `GROQ_API_KEY` | Vercel env | AI chat API |
| `RESEND_API_KEY` | Vercel env | Email service |
| `GOOGLE_AI_API_KEY` | Vercel env | RAG embeddings |
| `CRON_SECRET` | Vercel env | Daily reindex auth |

## Monitoring

- Health check: `GET /api/health`
- Set up **UptimeRobot** (free) to ping `/api/health` every 5 minutes
- Set up **Vercel Analytics** for performance monitoring
