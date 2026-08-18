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
| Embedded vanilla-JS admin dashboard | ✓ |
| Content CRUD (CLI + REST API) | ✓ |
| Media library (local filesystem + S3) | ✓ |
| RBAC (Administrator, Publisher, Editor) | ✓ |
| Magic-link auth + Entra ID OIDC | ✓ |
| `chukfi token <email>` JWT generation | ✓ |
| `chukfi seed` demo data | ✓ |
| `chukfi codegen` TypeScript type generation | ✓ |
| `chukfi init` | ✓ |
| Audit logging | ✓ |
| RDS dev instances (`chukfi db create`) | ✓ |

## v0.3.0

| Feature | Notes |
|---------|-------|
| Public read API (`/api/v1/public`) | Anonymous, published-only content surface (ADR-0013) |

## Planned (v0.4.0+)

| Feature | Notes |
|---------|-------|
| Production IaC (Terraform) | EC2 + ALB + RDS + S3 provisioning (ADR-0011/0012/0014) |
| Rust SSR frontend | Server-rendered public site, no Node, no JS framework |
| ALB path routing | `/admin`+`/api` → CMS, `/*` → SSR frontend |
| Content import | Import from WordPress WXR, Sanity NDJSON, Strapi JSON |
| RDS Proxy / connection pooling | Scale application hosts without exhausting Postgres connections |
| AWS X-Ray / tracing | Distributed tracing for DB queries and middleware overhead |

> **Superseded:** the earlier "AWS CDK provisioning" and "S3 + CloudFront for admin UI" items are replaced by the Terraform/IaC + embedded-dashboard direction above. The embedded dashboard ships inside the binary and does not require a separate static-asset/CDN deployment.

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
