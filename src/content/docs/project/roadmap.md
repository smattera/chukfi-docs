---
title: Roadmap
description: "Chukfi CMS feature roadmap — upcoming features, priorities, and completed milestones"
---

# Chukfi CMS — Feature Roadmap

> **Detailed roadmap moved to [Architecture → Roadmap](/architecture/architecture/#7-roadmap).** This page tracks lower-priority feature ideas and the v0.2.0 completed list.

## v0.2.0 — Shipped

| Feature | Status |
|---------|--------|
| Axum REST API with embedded migrations (`sqlx::migrate!`) | ✓ |
| `cargo install chukfi-bin` distribution | ✓ |
| Dioxus 0.7 WASM admin UI | ✓ |
| Content CRUD (CLI + REST API) | ✓ |
| Media library (local filesystem + S3) | ✓ |
| RBAC (Administrator, Publisher, Editor) | ✓ |
| Magic-link auth + Entra ID OIDC | ✓ |
| `chukfi token <email>` JWT generation | ✓ |
| `chukfi seed` demo data | ✓ |
| `chukfi site deploy` (Cloudflare Pages) | ✓ |
| `chukfi codegen` TypeScript type generation | ✓ |
| Audit logging | ✓ |
| Docker Compose deployment | ✓ |

## Planned (v0.3.0+)

| Feature | Notes |
|---------|-------|
| `chukfi init` | `init.rs` implemented, CLI wiring + .env.example template in v0.3.0 |
| AWS CDK provisioning | `deploy` command auto-provisioning RDS/ECS/CloudFront |
| Content import | Import from WordPress WXR, Sanity NDJSON, Strapi JSON |
| S3 + CloudFront for admin UI | Edge-cached static assets, API-only Fargate load |
| RDS Proxy / connection pooling | Scale ECS tasks without exhausting Postgres connections |
| AWS X-Ray / tracing | Distributed tracing for DB queries and middleware overhead |

---

## Completed (v0.1.0–v0.2.0)

- [x] Content types with typed fields (Text, Rich Text, Date, Number, Boolean, Media)
- [x] Content revisions (snapshot on save, restore)
- [x] Trash can (soft delete, 30-day retention)
- [x] Full-text search (PostgreSQL tsvector + GIN indexes)
- [x] Status workflow (draft / published / archived)
- [x] Per-record SEO fields
- [x] Content calendar
- [x] Media upload with MIME detection
- [x] Media library filtering (type, search)
- [x] Bulk actions (publish, archive, trash)
- [x] JWT-based sessions with configurable expiry
- [x] Role-based access control (colon-delimited permissions)
- [x] Admin dashboard with stats and activity feed
- [x] Magic link passwordless auth (SES in production, stdout in dev)

## Lower Priority (Backlog)

### Event Registration System
Public-facing event registration with Stripe payments, attendee management, waitlists, and CSV export.

### Approval / Editorial Workflow
Editorial review queue with `in_review` status, rejection notes, and in-app notification badges.

### Analytics Dashboard
Lightweight page view tracking (`GET /api/track`) with CloudWatch dashboard and top content metrics.

### Localization / i18n
Multi-language content variants with `locale` column, composite unique keys, and locale-specific API queries.

### Navigation Builder
Drag-and-drop tree editor for header/footer navigation outputting structured JSON.

### Nested / Repeatable Fields
Array-type fields with `subfields` stored as JSONB, with add/remove/reorder UI.
