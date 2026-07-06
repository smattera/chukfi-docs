---
title: Media Library
description: Upload, organize, and serve media assets backed by Amazon S3 — with drag-and-drop, filtering, and CLI support.
---

Chukfi's media library handles uploads, tagging, and serving — backed by Amazon S3 in production and the local filesystem during development.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/media-library-tour.webm" type="video/webm">
  <source src="/videos/media-library-tour.mp4" type="video/mp4">
</video>

## Features

- **Drag-and-drop upload** — Drop files into the browser, Chukfi handles MIME detection and storage
- **Type filtering** — Filter by image, document, or all media types
- **S3-backed** — Production media lives in an S3 bucket with lifecycle rules (Free Tier: 5 GB)
- **CLI support** — Upload and list media from the terminal with `chukfi media` commands

## CLI: Media Commands

### Upload a file

```bash
chukfi media upload \
  --path ./images/hero.png \
  --alt "Hero banner image" \
  --caption "Site hero banner" \
  --json
```

Auto-detects MIME type from file extension. Uploads to S3 (if AWS credentials present) or the local filesystem.

### List and search media

```bash
# All images
chukfi media list --mime-type image/ --json

# Search by alt text or caption
chukfi media list --q banner --limit 20 --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--mime-type` | *none* | Filter by MIME type prefix (e.g. `image/`) |
| `--q` | *none* | Search in alt text and caption |
| `--limit` | `50` | Maximum items (max 100) |
| `--offset` | `0` | Pagination offset |
| `--json` | `false` | Output as JSON |

## Storage

| Environment | Backend |
|-------------|---------|
| Local development | Filesystem (`./media/` directory) |
| Production | Amazon S3 |

The S3 bucket is provisioned by `npx chukfi deploy` with lifecycle rules and Free Tier pricing (5 GB included). No configuration needed — just deploy.
