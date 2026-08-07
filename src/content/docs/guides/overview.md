---
title: Overview
description: An overview of the Chukfi CMS platform — a headless CMS built with Rust, Dioxus, and PostgreSQL
---

Chukfi is a headless CMS — a content management system that provides a content API and admin interface without dictating how your frontend renders content.

> **Note:** The video below demonstrates a planned npm distribution workflow. v0.2.0 ships as a Rust binary — install via `cargo install chukfi-bin` or build from source. Follow the written guides below.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/admin-ui-tour.webm" type="video/webm">
  <source src="/videos/admin-ui-tour.mp4" type="video/mp4">
</video>

## How It Works

### Source-First Distribution

Chukfi ships as a Rust binary via `cargo install chukfi-bin`. Build from source for full access to the Dioxus admin UI, config templates, and per-developer RDS database via `chukfi db create`.

```bash
cargo install chukfi-bin    # Binary only (no admin UI)
chukfi serve                 # Start the API server on :4321
```

For the admin UI and config templates, clone the repo:

```bash
git clone https://github.com/smattera/chukfi-core
cd chukfi-core
cd chukfi-admin-ui && trunk serve    # Admin UI on :8081
```

### Local-to-Prod Parity

Local dev and production both use AWS RDS PostgreSQL — each developer gets their own `db.t4g.micro` instance via `chukfi db create`. Same engine, same migrations, same SQL. No SQLite dual-mode — the schema uses Postgres-specific features (`tsvector`, `JSONB`, `gen_random_uuid()`) that have no drop-in SQLite equivalents.

### Dioxus Admin UI

The admin interface — content editor, media library, schema builder, and settings — is built with Dioxus 0.7, compiled to WASM, and served by the Rust API at `/`. No JavaScript framework required; everything ships in one binary repo.

## Target Audience

Developers who want a headless CMS that compiles to a single Rust binary with a fast Dioxus admin UI and PostgreSQL-backed content management.
