---
title: Frontend Overview
description: Chukfi CMS frontend architecture — embedded vanilla-JS admin dashboard, optional Dioxus WASM UI, and Rust SSR for public sites
---

Chukfi ships an **embedded admin dashboard** as the default admin UI. The public-facing website is a separate concern: Chukfi is a headless CMS, so the public frontend is your choice — with Rust server-rendering as a first-class option that requires no Node.

## Admin Dashboard (default)

The default admin UI is a **vanilla-JS single-page app bundled into the binary** at compile time (`include_str!`). It needs no build step, no Node, and no separately deployed static assets:

- **Served automatically** when `adminUiPath` is **not set** in `chukfi.config.json`.
- Uses magic-link / Entra ID auth with a JWT stored in `localStorage`.
- Covers the core surface: dashboard stats, content list, schema-driven editor, media library.

```json
{
  "server": {
    "bindAddress": "0.0.0.0:8080"
  }
}
```

For production, **omit `adminUiPath`** so the embedded dashboard serves. (The CHC deployment config deliberately leaves it unset.)

## Dioxus Admin UI (optional)

A **Dioxus 0.7 WASM admin UI** also exists in `chukfi-admin-ui/` as an optional richer interface:

```bash
cd chukfi-admin-ui
trunk serve          # Dev on :8081, API on :8080
trunk build          # Production: outputs to dist/
```

To use it instead of the embedded dashboard, point `adminUiPath` at the built `dist/` directory:

```json
{
  "server": {
    "bindAddress": "0.0.0.0:8080",
    "adminUiPath": "./chukfi-admin-ui/dist"
  }
}
```

The embedded dashboard and the Dioxus UI are alternatives; the embedded dashboard is the zero-dependency default.

## Public Frontend (headless delivery)

Chukfi is headless: it exposes a REST API and does not dictate your frontend framework. Any frontend that can fetch JSON works.

**Rust server-rendered HTML is the recommended approach for the CHC public site** — no Node, no npm, and no JavaScript framework. A Rust SSR service (e.g. Axum + a Rust template engine) fetches published content from the [Public Read API](/api/public-read-api/) and renders server-side. Vanilla (framework-free) JavaScript is acceptable for progressive enhancement.

> The [Public Read API](/api/public-read-api/) is **implemented** (ADR-0013, v0.3.0) — public frontends can now consume published CMS content anonymously.

The [CLI Reference](/guides/cli/) includes `chukfi codegen` to generate TypeScript types for frontends that want typed content access.

## Search

Full-text search is backed by PostgreSQL `tsvector` with GIN indexes — no third-party search service needed.
