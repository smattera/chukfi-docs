---
title: Architecture
description: Chukfi CMS architecture overview — source-first distribution, Dioxus admin UI, Docker local dev, and AWS deployment
---

# Chukfi — Architecture (v0.2.0)

**Audience:** Platform maintainers, future contributors, developers evaluating Chukfi

## 1. Vision

Chukfi is an open-source headless CMS distributed as a Rust binary. Two pillars:

- **Source-first distribution** — `cargo install chukfi-bin` for the binary, or build from the repo for the full stack (API, admin UI, config templates).
- **Local-to-prod parity** — Local dev runs Docker-managed PostgreSQL; production runs AWS RDS PostgreSQL. Same engine, same migrations, same SQL.

**Target user:** Developers who want a headless CMS that compiles to a single Rust binary with a fast Dioxus admin UI and PostgreSQL-backed content management.

## 2. Repository Structure

```
chukfi-cms/
├── chukfi/             # Core library crate (Axum API, auth, content engine)
├── chukfi-bin/         # CLI binary (clap-based, all subcommands)
├── chukfi-types/       # Shared type definitions
├── chukfi-admin-ui/    # Dioxus 0.7 WASM admin interface
├── chukfi-ai/          # AI integration (Bedrock)
├── chukfi/migrations/  # SQL migrations (embedded via sqlx::migrate!)
│   ├── ...             # Content types, users, sessions, RBAC
│   └── 0008_navigation_groups.sql
├── docker-compose.yml  # PostgreSQL 16 for local dev
├── Dockerfile          # Multi-stage build
└── Cargo.toml          # Workspace root
```

## 3. Distribution

The binary ships via `cargo install chukfi-bin`. For the full stack (admin UI, config templates, Docker Compose), clone the repo:

```bash
git clone https://github.com/smattera/chukfi-core
cd chukfi-core
cargo build --release -p chukfi-bin
./target/release/chukfi serve
```

The binary embeds migrations via `sqlx::migrate!("./migrations")` and runs them automatically on startup — no separate `sqlx migrate run` needed.

### Commands

| Command | Purpose |
|---------|---------|
| `chukfi serve` | Start API server on configured port (default: 4321) |
| `chukfi seed` | Seed demo data for all content types in config |
| `chukfi token <email>` | Generate a dev JWT (auto-creates user) |
| `chukfi content` | Create, list, update content entries |
| `chukfi media` | Upload, list media assets |
| `chukfi site deploy` | Deploy frontend to Cloudflare Pages |
| `chukfi codegen` | Generate TypeScript types from schema |

## 4. Local Development

`docker compose up -d postgres` starts a PostgreSQL 16 container. The API connects via `DATABASE_URL` in `.env`. Content is managed through the REST API, CLI, or Dioxus admin UI.

The admin UI (`chukfi-admin-ui/`) is a separate Dioxus 0.7 WASM app:

```bash
cd chukfi-admin-ui
trunk serve          # Dev on :8081, API on :4321
trunk build          # Production: dist/ served by API
```

### PostgreSQL-only (no SQLite)

The schema uses Postgres-specific features with no drop-in SQLite equivalents:

- `tsvector` + GIN index for full-text search
- `JSONB` for `data`, `draft_data`, `diff`, `schema`
- `$1` parameter markers (sqlx does not rewrite at runtime)
- `gen_random_uuid()` defaults

## 5. Admin UI Architecture

The Dioxus admin UI is a WASM SPA with:

- **Content Editor** — Quill 2.0 rich text with image upload
- **Media Library** — Browse, upload, tag, filter
- **Content Types** — Define schemas with typed fields
- **Search** — Full-text via PostgreSQL tsvector
- **Auth** — JWT-based with magic link flow

Production serving: build with `trunk build`, set `adminUiPath` in config to point at `dist/`.

## 6. Deployment

### Local: Docker Compose

```bash
docker compose up -d
```

Starts PostgreSQL 16 and the Chukfi API on port 4321.

### Production: AWS + Cloudflare Pages

- **API + DB** — ECS Fargate + RDS PostgreSQL (manual provisioning in v0.2.0; CDK automation planned)
- **Media** — S3 (activated by setting `AWS_ACCESS_KEY_ID` and `S3_BUCKET`)
- **Frontend** — Cloudflare Pages via `chukfi site deploy --dir <frontend> --project <name>`

### Release Pipeline

GitHub Actions builds the binary, publishes to crates.io (`chukfi-bin` v0.2.0), and builds Docker images.

## 7. Roadmap

| # | Deliverable | v0.2.0? |
|---|-------------|---------|
| 1 | `chukfi serve` with embedded migrations | ✓ |
| 2 | Content CRUD (CLI + REST API) | ✓ |
| 3 | Media library (local + S3) | ✓ |
| 4 | Dioxus admin UI (WASM) | ✓ |
| 5 | RBAC + audit logging | ✓ |
| 6 | Cloudflare Pages deploy (`chukfi site deploy`) | ✓ |
| 7 | `codegen` (TypeScript types) | ✓ |
| 8 | `chukfi init` command | In progress |
| 9 | AWS CDK provisioning | Planned |
| 10 | Content import (WordPress, Sanity, Strapi) | Planned |
