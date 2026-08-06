---
title: Migration Guide
description: Migrating existing content from WordPress, Sanity, or Strapi into Chukfi CMS.
---

Content migration from existing CMS platforms is planned for a future release. In v0.2.0, demo data is available via `chukfi seed`, and content can be created programmatically via the CLI or REST API.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/migration-tour.webm" type="video/webm">
  <source src="/videos/migration-tour.mp4" type="video/mp4">
</video>

> **Note:** This video demonstrates a planned import workflow. v0.2.0 does not include a built-in import command. Content can be created via `chukfi content create` or the REST API.

## Creating Content Programmatically (v0.2.0)

While the one-click import is planned, you can populate Chukfi today:

```bash
# Create a page via CLI
chukfi content create \
  --type pages \
  --title "About Us" \
  --fields '{"body":"<p>Our story.</p>"}' \
  --status draft \
  --json

# Upload media
chukfi media upload --path ./photo.jpg --alt "Team photo" --json

# Publish
chukfi content update --id <uuid> --status published --json
```

## Future Import Support

The following formats are on the roadmap:

| Source | Format | Status |
|--------|--------|--------|
| **WordPress** | WXR (`.xml`) | Planned |
| **Sanity** | NDJSON export | Planned |
| **Strapi** | JSON export | Planned |

For custom migration scripts, the [CLI Reference](/guides/cli/) documents all content and media commands you can use to build your own import pipeline.

## After Creating Content

Run `chukfi codegen` to regenerate TypeScript types for your frontend:

```bash
chukfi codegen --out src/types
```
