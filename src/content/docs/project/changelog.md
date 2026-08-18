---
title: Changelog
description: Release notes and version history for Chukfi CMS
---

# Chukfi CMS — Changelog

## v0.3.0 — Public Read API (2026-08-18)

### Added

- **Public read API** — anonymous, published-only content surface under `/api/v1/public/` (list, slug lookup, and `/search`), gated by an opt-in `public: true` flag per content type and a `published`-only filter, with a dedicated `PublicEntry` DTO that structurally excludes draft data (ADR-0013).

### Changed

- Default Bedrock model → Claude 3.5 Haiku (cheaper default; still configurable).
- Production AI consolidated into the `chukfi-ai` crate.
- Default bind address is now `8080` (4321 was the legacy Astro dev port).

### Security

- Removed a customer-specific config file and redacted customer data from the public repository.

### Fixed

- An intermittent parallel-test race in the JWT secret tests.
- Docker build references to the removed `chukfi.config.json`.

---

## v0.2.0 — Source-First Rust Binary (2026-08-06)

Distribution model pivot: Chukfi ships as a Rust binary via `cargo install chukfi-bin`. The binary bundles an embedded admin dashboard; a Dioxus 0.7 WASM admin UI is available as an optional alternative.

### Added

- `cargo install chukfi-bin` distribution — single binary with embedded migrations
- `chukfi content` — create, list, update content entries from the CLI
- `chukfi media` — upload and list media assets (local filesystem or S3)
- `chukfi seed` — seed demo data for all content types
- `chukfi token <email>` — generate a dev JWT (auto-creates user)
- `chukfi codegen` — generate TypeScript types from content schema
- `chukfi serve` — start the API server with auto-migrations on startup
- `chukfi init` — scaffold a new project with config and .env
- Embedded vanilla-JS admin dashboard (bundled in the binary)
- Dioxus 0.7 WASM admin UI (optional) with Quill 2.0 rich text editor
- Per-developer RDS PostgreSQL via `chukfi db create`
- RBAC (Administrator, Publisher, Editor) with colon-delimited permissions
- Magic-link passwordless auth + Entra ID OIDC
- Audit logging
- Full-text search via PostgreSQL tsvector + GIN indexes
- Content revisions (snapshot on save, restore)
- Trash can (soft delete, 30-day retention)
- Status workflow (draft / published / archived)
- Content calendar
- Content types with typed fields (Text, Rich Text, Date, Number, Boolean, Media)
- Per-record SEO fields
- Media library with MIME detection and filtering

### Removed

- npm distribution (never shipped) — no `@chukfi/cli`, no `npx chukfi`
- `chukfi site deploy` — Cloudflare Pages deploy wrapper removed; deploy your frontend however you prefer

### Planned for v0.4.0

- Production IaC (Terraform) — EC2 + ALB + RDS + S3 provisioning
- Rust SSR frontend — server-rendered public site, no Node
- Content import — migrate from WordPress WXR, Sanity NDJSON, Strapi JSON

### Migration from pre-v0.2.0

If you were using the npm preview CLI: install the binary via `cargo install chukfi-bin`, copy `chukfi-bin/templates/standard.config.json` to `chukfi.config.json`, and set `DATABASE_URL` + `CHUKFI_JWT_SECRET` in `.env`. All commands (`serve`, `seed`, `token`, etc.) are now subcommands of `chukfi` rather than `npx chukfi`.

---

## v0.1.0 — Initial Preview (2026-Q2)

Initial repository structure with Axum API core, SQL migrations, and workspace layout.

### Added

- `chukfi/` core library crate (Axum API, auth, content engine)
- `chukfi-bin/` CLI binary skeleton (clap-based)
- `chukfi-types/` shared type definitions
- `chukfi-admin-ui/` Dioxus 0.7 WASM admin interface scaffold
- `chukfi-ai/` AI integration (Bedrock) crate
- PostgreSQL migrations for content types, users, sessions, RBAC
- Magic-link auth flow
- JWT-based sessions with configurable expiry
- Role-based access control (colon-delimited permissions)
- Content type schema system with typed fields
- Admin dashboard with stats and activity feed
- CRUD REST API for content entries
- `chukfi db create` for per-dev AWS RDS PostgreSQL
- `chukfi db destroy` to tear down instances
