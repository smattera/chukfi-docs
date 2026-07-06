---
title: Frontend Overview
description: Chukfi CMS frontend architecture — Astro 7, React islands, and admin interface
---

The Chukfi CMS frontend is built with Astro 7 and React 19, providing a modern admin interface for content management.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/astro-integration-tour.webm" type="video/webm">
  <source src="/videos/astro-integration-tour.mp4" type="video/mp4">
</video>

## Architecture

- **Astro 7** — Static site generation with server-side rendering support
- **React 19 islands** — Interactive admin components (schema builder, content editor, media library)
- **shadcn/ui** — Visual primitives for consistent design
- **Admin UI** — Pre-compiled SPA served by the Rust binary at `/`

## Key Pages

- **Admin Dashboard** — Stats cards, quick-access links, recent activity feed
- **Content Editor** — Schema-driven form for creating and editing entries
- **Media Library** — Upload, tag, filter, search, and organize media
- **Schema Builder** — Define custom content types with typed fields
- **Form Builder** — Create public-facing forms with drag-and-drop fields
- **Settings Hub** — General settings, webhooks, API keys, redirects

## Features

- Dark mode with system preference detection
- Command palette (`Cmd+K` / `Ctrl+K`)
- Content Calendar with month-grid view
- Bulk actions (publish, archive, trash, export)
- Full-text search with highlighted results
- **Two-factor authentication**
- **oEmbed support** for YouTube, Vimeo, Twitter/X

## Search

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/search-tour.webm" type="video/webm">
  <source src="/videos/search-tour.mp4" type="video/mp4">
</video>

Full-text search is backed by PostgreSQL `tsvector` with GIN indexes — no third-party search service needed. Search across all content types with highlighted results and sub-30ms response times.
