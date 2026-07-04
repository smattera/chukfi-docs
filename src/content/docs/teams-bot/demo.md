---
title: Demo Script
description: A complete walkthrough for demonstrating the Chukfi Teams Bot — from setup to content management in Teams.
---

## Demo Setup

### Prerequisites

- Teams Bot running (local or deployed)
- Chukfi CMS running with a PostgreSQL database
- A Microsoft Teams channel with the Outgoing Webhook configured

### Quick Start (Local Demo)

```bash
# Terminal 1: Start the Chukfi CMS
cd ~/GitHub/chukfi-cms
cargo run -- serve

# Terminal 2: Start the Teams Bot (no HMAC for demo)
cd ~/GitHub/chukfi-teams-bot
TEAMS_WEBHOOK_SECRET="" DATABASE_URL="postgresql://..." \
  uvicorn main:app --reload --port 8000

# Terminal 3: Test with curl
curl -X POST http://localhost:8000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"text":"Create a blog post about flu shots","from":{"name":"demo@chc.org"}}'
```

## Demo Walkthrough

### 1. Create a Blog Post

**User says:** `@Chukfi CMS Bot create a blog post about fall health tips`

**Bot responds:**
> ✅ I've created a draft blog post titled "Fall Health Tips" in the blog-posts content type.
>
> **Entry ID:** `abc-123-def-456`
> **Status:** Draft (needs human review before publishing)
> **Created:** Just now

**Verify:** Check the admin UI → Blog Posts → should show a new draft entry.

### 2. List Recent Content

**User says:** `@Chukfi CMS Bot show me recent blog posts`

**Bot responds:**
> Here are the recent blog posts:
>
> 1. **Fall Health Tips** (Draft) — Created just now
> 2. **Flu Season Preparedness** (Published) — Created 2 days ago
> 3. **New Clinic Hours** (Published) — Created 1 week ago

### 3. Update Content

**User says:** `@Chukfi CMS Bot update the fall health tips post to add a section about vaccines`

**Bot responds:**
> ✅ I've updated the "Fall Health Tips" entry with the new vaccine section. It remains in draft status for review.

### 4. Upload Media

**User says:** `@Chukfi CMS Bot upload the file /images/flu-banner.png as the featured image for the flu post`

**Bot responds:**
> ✅ I've uploaded `flu-banner.png` to the media library.
>
> **Media ID:** `media-789-xyz`
> **Alt text:** "Flu season banner"
> **File size:** 245 KB

### 5. Multi-Step Workflow

**User says:** `@Chukfi CMS Bot I need to create a new event for the vaccine clinic next week. Title it "Vaccine Clinic - Dec 15" and set the date to December 15th.`

**Bot responds:**
> ✅ I've created a draft event titled "Vaccine Clinic - Dec 15" in the events content type.
>
> **Entry ID:** `evt-456-789`
> **Status:** Draft
> **Fields set:** date → December 15, 2026
>
> A human will need to review and publish this before it appears on the website.

## What to Show

### For Healthcare Staff

- **"Create a blog post about..."** — Shows how easy content creation is
- **"Show me recent events"** — Demonstrates content discovery
- **"Update the clinic hours page"** — Shows editing capabilities
- **"All content is draft"** — Emphasizes the safety guardrail

### For Technical Audiences

- **HMAC verification** — Security layer 1
- **Tenant ID validation** — Security layer 2
- **Content type whitelist** — Security layer 3
- **Draft-only enforcement** — Security layer 4
- **Tool-use loop** — How Claude calls the CLI
- **Subprocess isolation** — No shell injection

### For Executives

- **Cost: ~$22/month** — All-in for moderate usage
- **No data training** — Bedrock doesn't train on your data
- **Draft-only** — No accidental publishing
- **Tenant-restricted** — Only authorized tenants can use it

## Demo Troubleshooting

| Issue | Fix |
|-------|-----|
| Bot doesn't respond in Teams | Check the callback URL is HTTPS and publicly accessible |
| `401 Invalid HMAC` | You're in production mode — disable HMAC for demo or set the correct secret |
| `Access Denied` | The tenant ID isn't in the allowlist — check `config.py` |
| Bedrock errors | Verify AWS credentials and model access |
| CLI errors | Check `DATABASE_URL` and that `chukfi` is on PATH |
