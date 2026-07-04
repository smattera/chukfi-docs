---
title: CLI Reference
description: Complete reference for the Chukfi CLI — content management, media uploads, site deployment, and code generation.
---

The `chukfi` CLI is the primary interface for managing your CMS, both for humans and AI agents. Every command supports `--json` for machine-parseable output and clear exit codes.

## Installation

```bash
cargo install chukfi
# or build from source:
cd chukfi-cms && cargo build --release -p chukfi-bin
./target/release/chukfi --help
```

## Global Conventions

| Convention | Description |
|------------|-------------|
| `--json` | Output results as structured JSON instead of human-readable text |
| Exit code 0 | Success |
| Exit code 1 | Validation error (bad input, missing env vars) |
| Exit code 2 | Authentication / authorization failure |

## Environment Variables

| Variable | Required For | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | `content`, `media` commands | PostgreSQL connection string |
| `CHUKFI_CONFIG` | `content create`, `codegen` | Path to `chukfi.config.json` (default: `./chukfi.config.json`) |
| `CLOUDFLARE_API_TOKEN` | `site deploy` | Cloudflare API token with Pages Deploy permission |
| `AWS_ACCESS_KEY_ID` | `media upload` (S3) | AWS credentials for S3-backed media storage |
| `S3_BUCKET` | `media upload` (S3) | S3 bucket name (default: `chukfi-media`) |

## Commands

### `chukfi serve`

Start the HTTP server.

```bash
chukfi serve
```

Reads `chukfi.config.json` and `DATABASE_URL` from the environment. Runs database migrations on startup.

### `chukfi seed`

Seed demo data into the database.

```bash
chukfi seed
```

Creates sample entries for each content type defined in `chukfi.config.json`. Useful for development and demos.

### `chukfi token <email>`

Generate a JWT for local development.

```bash
chukfi token user@example.com
# eyJhbGciOiJIUzI1NiIs...
```

Creates the user if they don't exist and returns a signed JWT. Paste into `sessionStorage.setItem('chukfi_token', '<token>')` to authenticate in the admin UI.

### `chukfi content create`

Create a new content entry.

```bash
chukfi content create \
  --type blog-posts \
  --title "Hello World" \
  --fields '{"body":"<p>First post!</p>"}' \
  --status draft \
  --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--type` | *required* | Content type slug (e.g. `blog-posts`) |
| `--title` | *required* | Entry title |
| `--fields` | `{}` | JSON string of additional field values |
| `--status` | `draft` | `draft` or `published` |
| `--json` | `false` | Output as JSON |

**JSON output:**

```json
{"status":"created","id":"uuid","slug":"hello-world","type":"blog-posts","title":"Hello World"}
```

### `chukfi content list`

List content entries.

```bash
chukfi content list --type blog-posts --status published --limit 5 --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--type` | *required* | Content type slug |
| `--status` | `all` | Filter: `draft`, `published`, or `all` |
| `--limit` | `10` | Maximum entries to return |
| `--offset` | `0` | Pagination offset |
| `--json` | `false` | Output as JSON |

### `chukfi content update`

Update an entry's status or fields.

```bash
chukfi content update \
  --id <uuid> \
  --status published \
  --fields '{"featured":true}' \
  --json
```

| Flag | Description |
|------|-------------|
| `--id` | Entry UUID |
| `--status` | New status (`draft` or `published`) |
| `--fields` | JSON string of fields to merge |
| `--json` | Output as JSON |

### `chukfi media upload`

Upload a file to the media library.

```bash
chukfi media upload \
  --path ./images/hero.png \
  --alt "Hero banner image" \
  --caption "Site hero banner" \
  --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--path` | *required* | Path to the file to upload |
| `--alt` | `""` | Alt text for images |
| `--caption` | `""` | Caption / description |
| `--json` | `false` | Output as JSON |

Auto-detects MIME type from file extension. Uploads to S3 (if AWS credentials present) or local filesystem.

### `chukfi media list`

List media items.

```bash
chukfi media list --mime-type image/ --q banner --limit 20 --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--mime-type` | *none* | Filter by MIME type prefix (e.g. `image/`) |
| `--q` | *none* | Search in alt text and caption |
| `--limit` | `50` | Maximum items (max 100) |
| `--offset` | `0` | Pagination offset |
| `--json` | `false` | Output as JSON |

### `chukfi site deploy`

Build and deploy the frontend to Cloudflare Pages.

```bash
chukfi site deploy \
  --dir ./frontend \
  --project chukfi-docs \
  --yes \
  --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--dir` | `.` | Path to the frontend project directory |
| `--project` | `chukfi-docs` | Cloudflare Pages project name |
| `--branch` | `main` | Branch context for the deploy |
| `--yes` / `-y` | `false` | Skip confirmation prompt |
| `--json` | `false` | Output as JSON |

Runs `npm ci`, `npm run build`, then `npx wrangler pages deploy`. Requires `CLOUDFLARE_API_TOKEN` in the environment.

### `chukfi codegen`

Generate TypeScript types from the content schema.

```bash
chukfi codegen --out src/types
```

Reads `chukfi.config.json` and generates a `chukfi-types.ts` file with TypeScript interfaces for every content type, plus union types for content type slugs and entry types.

| Flag | Default | Description |
|------|---------|-------------|
| `--out` | `src/types` | Output directory for generated files |

**Example output:**

```typescript
// Auto-generated by `chukfi codegen` — do not edit manually.

export interface BlogPosts {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  locale: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  body: string;
}

export type ContentTypeSlug = 'blog-posts' | 'pages' | 'staff';
export type ContentEntry = BlogPosts | Pages | Staff;
```

## Common Workflows

### AI Agent: Create and publish content

```bash
# 1. Create a draft
chukfi content create --type blog-posts --title "New Post" --fields '{"body":"<p>Content</p>"}' --status draft --json

# 2. Upload a featured image
chukfi media upload --path ./featured.png --alt "Featured image" --json

# 3. Publish
chukfi content update --id <uuid> --status published --json
```

### AI Agent: Deploy after changes

```bash
chukfi site deploy --dir ./frontend --project chukfi-docs --yes --json
```

### Developer: Generate types for the frontend

```bash
chukfi codegen --out ../frontend/src/types
```
