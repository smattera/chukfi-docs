---
title: Public Read API
description: Public read API for serving published content anonymously (ADR-0013)
---

# Public Read API

> **Status: Implemented (v0.3.0, PR #48).**
>
> This page documents Chukfi's public read API, authorized by ADR-0013. The endpoints described here are live in the shipped binary.

## Purpose

Chukfi is a headless CMS with an **admin** API (authenticated) but no anonymous content surface. The public read API is the read-only surface that lets a public website (and future mobile apps) fetch **published** content without authentication — while never exposing drafts or internal metadata.

## Design (locked decisions)

| Decision | Value |
|----------|-------|
| Namespace | `/api/v1/public/...` |
| Opt-in | Per content type via `public: true` flag, default `false` |
| Gate | Only `published` entries are returned |
| Identifier | Slug in the URL; UUID in the response body |
| DTO | Dedicated `PublicEntry` DTO — never the raw admin `ContentEntry` |
| Exposure | Whole-type: all configured `data` fields of a public type are exposed in v1; field-level visibility deferred |
| Pagination | Offset/limit (`?limit=` default 20, max 100; `?offset=`, `ORDER BY updated_at DESC`) |
| Locale | Default locale, `?locale=` override |

## Endpoint shape

```
GET /api/v1/public/{content-type}          → list entries (published only)
GET /api/v1/public/{content-type}/{slug}   → single entry by slug
GET /api/v1/public/search                  → search published content
```

- `{content-type}` resolves against the content-type **slug** in `chukfi.config.json`; only types with `public: true` are reachable.
- `/search` is a reserved path on the public surface — a content type literally named `search` is disallowed to avoid a route collision with `GET /api/v1/public/search`.
- List pagination: `?limit=` (default 20, maximum 100), `?offset=`, ordered by `updated_at DESC`.
- Search is part of the v1 contract and uses the same offset/limit scheme; the search-term parameter is `q` (e.g. `GET /api/v1/public/search?q=chickasaw`).

## `PublicEntry` DTO

The public response uses a dedicated DTO so draft content and internal metadata are **structurally excluded** — not merely filtered at query time. Fields carried on the admin `ContentEntry` that the public DTO must **not** include: `draft_data`, `moderation_reason`, `translation_group_id`, `publish_at`, `type_id`, `status`.

**Confirmed field set:** `id`, `slug`, `data`, `seo`, `locale`, `createdAt`, `updatedAt`.

## Deliberately excluded from v1

- Field-level visibility (`public` at the per-field level) — deferred; whole-type exposure ships first.
- Cursor/keyset pagination — deferred; offset/limit is the v1 contract.

## Related

- [Backend Overview](/backend/overview/)
- [Content Types](/guides/content-types/)
