---
title: Frontend Overview
description: Chukfi CMS frontend architecture — Dioxus 0.7 WASM admin UI and headless delivery.
---

The Chukfi CMS admin interface is built with Dioxus 0.7, compiled to WebAssembly, and served by the Rust API.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/astro-integration-tour.webm" type="video/webm">
  <source src="/videos/astro-integration-tour.mp4" type="video/mp4">
</video>

> **Note:** This video references an Astro integration. v0.2.0 ships a Dioxus admin UI — see below for current architecture.

## Architecture

- **Dioxus 0.7** — Rust-based reactive UI framework, compiled to WASM
- **Trunk** — WASM bundler and dev server (port 8081)
- **Tailwind CSS v4** — Utility-first styling

The admin UI is built in `chukfi-admin-ui/` and runs via `trunk serve` during development. For production, build with `trunk build` and point the API's `adminUiPath` in `chukfi.config.json` to the `dist/` directory.

## Building and Serving

```bash
cd chukfi-admin-ui
trunk serve            # Dev: admin UI on :8081, API on :4321
trunk build            # Production: outputs to dist/
```

The Rust API (`chukfi serve`) can serve the built admin UI if `adminUiPath` is set:

```json
{
  "server": {
    "bindAddress": "0.0.0.0:4321",
    "adminUiPath": "./chukfi-admin-ui/dist"
  }
}
```

## Key Pages

- **Admin Dashboard** — Stats cards, quick-access links, recent activity feed
- **Content Editor** — Schema-driven form for creating and editing entries
- **Media Library** — Upload, tag, filter, search, and organize media
- **Content Types** — Define custom content types with typed fields

## Headless Delivery

Chukfi is a headless CMS — it provides a REST API for content delivery but does not dictate your frontend framework. Use any frontend (Astro, Next.js, SvelteKit, plain HTML) to fetch content from the API. The [CLI Reference](/guides/cli/) includes a `chukfi codegen` command to generate TypeScript types for your frontend.

## Search

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/search-tour.webm" type="video/webm">
  <source src="/videos/search-tour.mp4" type="video/mp4">
</video>

Full-text search is backed by PostgreSQL `tsvector` with GIN indexes — no third-party search service needed.
