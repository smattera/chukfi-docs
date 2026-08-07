---
title: CLI Reference
description: Complete reference for the Chukfi CMS CLI — content management, media uploads, and code generation.
---

The `chukfi` CLI is the primary interface for managing your CMS, both for humans and AI agents. Every command supports `--json` for machine-parseable output and clear exit codes.

## Installation

```bash
cargo install chukfi-bin
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
| `DATABASE_URL` | `serve`, `seed`, `content`, `media` commands | PostgreSQL connection string |
| `CHUKFI_CONFIG` | `serve`, `seed`, `content create`, `codegen` | Path to `chukfi.config.json` (default: `./chukfi.config.json`) |
| `CHUKFI_JWT_SECRET` | `serve`, `token` | Secret key for JWT signing (required at runtime; can be set in `.env`) |
| `CHUKFI_DEV_MODE` | `serve` | When `true`, auto-creates users on first login and enables permissive CORS |
| `AWS_ACCESS_KEY_ID` | `media upload` (S3) | AWS credentials for S3-backed media storage |
| `S3_BUCKET` | `media upload` (S3) | S3 bucket name (default: `chukfi-media`) |

## Commands

### `chukfi db`

Manage per-developer AWS RDS PostgreSQL instances.

```bash
# Create a dev database (~10 min first time)
chukfi db create --name my-chukfi-dev --region us-east-1

# List your instances
chukfi db list --region us-east-1

# Destroy an instance (no more billing)
chukfi db destroy --id my-chukfi-dev --yes
```

| Flag | Default | Description |
|------|---------|-------------|
| `--name` | `chukfi-dev` | Instance identifier (lowercase, hyphens ok) |
| `--region` | `us-east-1` | AWS region |
| `--id` | *required* | Instance identifier to destroy |
| `--yes` | `false` | Skip confirmation prompt for `destroy` |

Each developer gets their own `db.t4g.micro` instance tagged `Project=chukfi-dev`. Credentials are auto-generated (32-char random password) and printed to stdout. Tear down when not in use to avoid ~$15/month charges.

### `chukfi serve`

Start the HTTP server.

```bash
chukfi serve
```

Reads `chukfi.config.json` and `DATABASE_URL` from the environment. Runs database migrations on startup. Serves the API on the configured port (default: `4321`).

### `chukfi seed`

Seed demo data into the database.

```bash
chukfi seed
```

Creates demo entries for every content type defined in `chukfi.config.json`. Navigation groups ship with schema migrations. Users are created lazily via `chukfi token`.

### `chukfi token <email>`

Generate a JWT for local development.

```bash
chukfi token user@example.com
# eyJhbG...NiIs...
```

Creates the user if they don't exist (with role `editor`) and returns a signed JWT. Paste into `sessionStorage.setItem('chukfi_token', '<token>')` to authenticate in the admin UI.

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

Auto-detects MIME type from file extension. Uploads to S3 (if `AWS_ACCESS_KEY_ID` present) or local filesystem.

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

### Developer: Generate types for the frontend

```bash
chukfi codegen --out ../admin-ui/src/types
```
