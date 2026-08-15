---
title: Architecture
description: Chukfi CMS architecture overview — binary-first distribution, embedded dashboard, and AWS deployment on EC2 + RDS + S3
---

# Chukfi — Architecture (v0.2.0)

**Audience:** Platform maintainers, future contributors, developers evaluating Chukfi

## 1. Vision

Chukfi is an open-source headless CMS distributed as a single Rust binary. Two pillars:

- **Binary-first distribution** — `cargo install chukfi-bin` is the supported installation path. The binary bundles the admin dashboard, so `chukfi serve` gives you a working CMS out of the box.
- **Local-to-prod parity** — Both local development and production use AWS RDS PostgreSQL. Same engine, same migrations, same SQL.

**Target user:** Developers who want a headless CMS that compiles to one Rust binary with an embedded admin dashboard and PostgreSQL-backed content management.

## 2. Repository Structure

```
chukfi-core/
├── chukfi/             # Core library crate (Axum API, auth, content engine)
├── chukfi-bin/         # CLI binary (clap-based, all subcommands)
├── chukfi-types/       # Shared type definitions
├── chukfi-admin-ui/    # Dioxus 0.7 WASM admin interface (build-optional)
├── chukfi-ai/          # AI integration (Bedrock)
├── chukfi/migrations/  # SQL migrations (embedded via sqlx::migrate!)
├── chukfi/src/dashboard.html  # Embedded vanilla-JS admin dashboard
├── README.md
└── Cargo.toml          # Workspace root
```

## 3. Distribution

The binary ships via `cargo install chukfi-bin`:

```bash
cargo install chukfi-bin
chukfi serve
```

The binary embeds migrations via `sqlx::migrate!` and runs them automatically on startup — no separate migration step, no source checkout.

Source checkout is for **contributors** only, not the normal install path:

```bash
git clone https://github.com/smattera/chukfi-core
cd chukfi-core
cargo build --release -p chukfi-bin
```

### Commands

| Command | Purpose |
|---------|---------|
| `chukfi serve` | Start API server on configured port (default: 4321) |
| `chukfi seed` | Seed demo data for all content types in config |
| `chukfi token <email>` | Generate a dev JWT (auto-creates user) |
| `chukfi content` | Create, list, update content entries |
| `chukfi media` | Upload, list media assets |
| `chukfi codegen` | Generate TypeScript types from schema |
| `chukfi init` | Write a starter `chukfi.config.json` + `.env.example` |

## 4. Local Development

Each developer creates their own RDS PostgreSQL instance via `chukfi db create`. The API connects via `DATABASE_URL` in `.env`. Content is managed through the REST API, CLI, or the admin dashboard.

### PostgreSQL-only (no SQLite)

The schema uses Postgres-specific features with no drop-in SQLite equivalents:

- `tsvector` + GIN index for full-text search
- `JSONB` for `data`, `draft_data`, `diff`, `schema`
- `$1` parameter markers (sqlx does not rewrite at runtime)
- `gen_random_uuid()` defaults

## 5. Admin Dashboard

The **embedded dashboard** is the default admin UI. It is a vanilla-JS single-page app bundled into the binary at compile time (`include_str!`) and served automatically when `adminUiPath` is not set in config. No separate build step, no Node, no static assets to deploy.

A **Dioxus 0.7 WASM admin UI** also exists in `chukfi-admin-ui/` as an optional richer interface:

```bash
cd chukfi-admin-ui
trunk serve          # Dev on :8081, API on :4321
trunk build          # Production: dist/ served by API
```

Production deployments that want the embedded dashboard should **omit** `adminUiPath` from config. Setting `adminUiPath` points the API at a Dioxus `dist/` directory instead — leave it unset for the zero-dependency embedded dashboard.

## 6. Deployment

### Local: RDS backend

The API runs on your laptop, the database is on AWS:

```bash
chukfi db create --name my-chukfi-dev --region us-east-1
# Paste the DATABASE_URL it prints into your .env, then:
chukfi serve
```

### Production: AWS (EC2, no containers)

The recommended production stack is **EC2 + ALB + RDS + S3**:

- **Compute** — ARM64 EC2 (Graviton) running the static musl binary under `systemd`. No Docker at runtime.
- **Database** — managed RDS PostgreSQL (private subnet, encrypted at rest, automated backups).
- **Media** — S3 (activated by setting `S3_BUCKET`; the SDK obtains credentials from the instance role).
- **TLS** — Application Load Balancer terminates HTTPS (ACM certificate) and forwards to the private EC2 instance. The binary listens plain HTTP on 4321.
- **Routing** — ALB path rules send `/admin*`, `/api/*`, and `/health` to the CMS; a separate Rust SSR frontend serves the public site on the default `/*` rule.

Provisioning is done with your own IaC (Terraform is the current direction for the CHC deployment); `chukfi db create` is a **dev-only** helper and is not used for production RDS. See [Production Deployment](/guides/production-deployment/) and [Deployment Overview](/deployment/overview/).

### Release Pipeline

GitHub Actions builds the binary and publishes to crates.io (`chukfi-bin`).

## 7. Roadmap

| # | Deliverable | v0.2.0? |
|---|-------------|---------|
| 1 | `chukfi serve` with embedded migrations | ✓ |
| 2 | Content CRUD (CLI + REST API) | ✓ |
| 3 | Media library (local + S3) | ✓ |
| 4 | Embedded vanilla-JS dashboard | ✓ |
| 5 | RBAC + audit logging | ✓ |
| 6 | `codegen` (TypeScript types) | ✓ |
| 7 | `chukfi init` command | ✓ |
| 8 | Public read API (`/api/v1/public`) | Planned |
| 9 | Production IaC (Terraform) | Planned |
| 10 | Content import (WordPress, Sanity, Strapi) | Planned |
