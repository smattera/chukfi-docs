---
title: Migration Guide
description: Migrate existing content from WordPress, Sanity, or Strapi into Chukfi CMS with a single CLI command.
---

Migrating to a new CMS shouldn't mean copy-pasting hundreds of entries. Chukfi provides a powerful CLI import tool to pull your existing content, media, and schemas into your local PostgreSQL database in seconds.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/migration-tour.webm" type="video/webm">
  <source src="/videos/migration-tour.mp4" type="video/mp4">
</video>

## One-Command Import

Chukfi supports importing directly from standard export formats (WordPress XML, Strapi JSON exports, etc.):

```bash
npx chukfi import --source wordpress.xml
```

This command will:

1. **Parse** your source file and map categories to Chukfi content types
2. **Download** and optimize all referenced media assets
3. **Batch insert** entries into your local PostgreSQL database as drafts

## Supported Sources

| Source | Format | Notes |
|--------|--------|-------|
| **WordPress** | WXR (`.xml`) | Preserves posts, pages, categories, tags, and media |
| **Sanity** | NDJSON export | Maps document schemas to content types |
| **Strapi** | JSON export | Handles dynamic zones and component fields |

## Import Workflow

```bash
# 1. Export from your old CMS (e.g., WordPress Tools → Export)
# 2. Point Chukfi at the export file
npx chukfi import --source wordpress.xml

# 3. Review the drafts in the Admin UI
# 4. Publish when ready
```

All imported entries are created as **drafts** — nothing goes live until you review and publish it. Media is uploaded to your S3 bucket (production) or local filesystem (development).

## After Import

Run `npx chukfi codegen` to regenerate TypeScript types if your imported content introduced new fields that need frontend type coverage:

```bash
npx chukfi codegen --out src/types
```
