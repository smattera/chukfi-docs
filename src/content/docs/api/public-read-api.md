---
title: Public Read API
description: Planned public read API for serving published content anonymously (ADR-0013)
---

# Public Read API

> **Status: Planned — not yet implemented.**
>
> This page documents the **design contract** for Chukfi's public read API, authorized by ADR-0013. The endpoints described here do **not** exist in the shipped binary yet. Treat this as a spec, not a reference for a live API.

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
| Pagination | Offset/limit for v1 (not cursor/keyset) |

## Endpoint shape

```
GET /api/v1/public/{content-type}          → list entries (published only)
GET /api/v1/public/{content-type}/{slug}   → single entry by slug
```

- `{content-type}` resolves against the content-type **slug** in `chukfi.config.json`; only types with `public: true` are reachable.
- List pagination is offset/limit. Exact parameter names, defaults, and max limit are implementation details still being finalized.

## `PublicEntry` DTO

The public response uses a dedicated DTO so draft content and internal metadata are **structurally excluded** — not merely filtered at query time. Fields carried on the admin `ContentEntry` that the public DTO must **not** include: `draft_data`, `moderation_reason`, `translation_group_id`, `publish_at`, `type_id`, `status`.

The exact set of fields exposed and their serialization names (`id`, `slug`, `data`, `seo`, `locale`, timestamps) is still being finalized.

## Deliberately excluded from v1

- Field-level visibility (`public` at the per-field level) — deferred; whole-type exposure ships first.
- Cursor/keyset pagination — deferred; offset/limit is the v1 contract.
- Search over the public surface — not part of the initial contract.

## Related

- [Backend Overview](/backend/overview/)
- [Content Types](/guides/content-types/)
