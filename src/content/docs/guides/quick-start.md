---
title: Quick Start
description: Get started with Chukfi CMS in minutes — install, local dev, and deploy
---

<video controls="" autoplay="" loop="" muted="" playsinline="" style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/quick-start.webm" type="video/webm">
  <source src="/videos/quick-start.mp4" type="video/mp4">
</video>

## Prerequisites

- **Rust 1.91+** — Chukfi CLI is a Rust binary. Install via [rustup](https://rustup.rs).
- **PostgreSQL** — via Docker, a local PostgreSQL service (Homebrew, Postgres.app), or AWS Secrets Manager
- **Node.js 18+** — only if you're using the Astro frontend integration (the CLI itself doesn't need Node)
- An AWS account (for production deployment)

## Install from Source

The `@chukfi/cli` npm package is pending publication (targeting v0.3.0). For v0.2.x, install directly from GitHub:

```bash
cargo install --git https://github.com/smattera/chukfi-cms chukfi-bin
```

## Local Development

Start the API server:

```bash
chukfi serve
```

Chukfi handles PostgreSQL setup automatically:
1. **With Docker:** If Docker is running, the CLI spawns an ephemeral `postgres:17-alpine` container on port 5433, runs migrations, and starts the API.
2. **Without Docker (interactive prompt):** If Docker is absent, the CLI walks you through connecting to a local PostgreSQL instance, or pulling development credentials from AWS Secrets Manager. It validates the connection and saves it to `.env` so subsequent runs skip the prompt.
3. Starts the Rust API on port 8080.

Your CMS is now running at **http://localhost:8080**.

## Create Your First Content

```bash
chukfi content create \
  --type blog-posts \
  --title "Hello World" \
  --fields '{"body":"<p>Welcome to Chukfi CMS</p>"}' \
  --status draft
```

> **Tip:** `chukfi content list --type blog-posts` lists all entries for a content type. Use `chukfi content update --id <uuid> --status published` to publish.

## Seed Demo Data

Spin up demo content for testing:

```bash
chukfi seed
```

## Generate a Dev JWT

```bash
chukfi token admin@chukfi.dev
```

## Deploy to Production

```bash
chukfi site deploy --dir ./frontend --project <cloudflare-project>
```

A single command to deploy your frontend to Cloudflare Pages. Requires: Cloudflare Wrangler configured.

> **Coming in v0.3.0:** `npx @chukfi/cli dev`, `npx @chukfi/cli init`, and `npx @chukfi/cli deploy` — ergonomic aliases wrapping the lower-level commands above.

## Troubleshooting

### "Docker daemon not running"

If Docker is absent, Chukfi will prompt you interactively for local PostgreSQL credentials or AWS Secrets Manager. To skip Docker entirely, ensure no Docker socket is available and run `chukfi serve` — the prompt will guide you.

### "Address already in use (port 8080)"

Another process is occupying port 8080. Kill it with `lsof -ti:8080 | xargs kill`, or set `CHUKFI_PORT=3000` in your `.env` file.

### "AWS credentials not configured" (deploy)

Run `aws configure` to set up your AWS access key, secret key, and region. Deploy uses the default profile unless `AWS_PROFILE` is set.
