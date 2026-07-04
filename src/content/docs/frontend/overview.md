---
title: Frontend Overview
description: Chukfi CMS frontend architecture
---

The Chukfi CMS frontend is built with Astro 5 and React 19, providing a modern admin interface for content management.

## Architecture

- **Astro 5** — Static site generation with server-side rendering support
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
- Two-factor authentication
- oEmbed support for YouTube, Vimeo, Twitter/X
