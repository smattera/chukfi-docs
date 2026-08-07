---
title: Quick Start
description: Get Chukfi CMS running in 5 minutes with an AWS RDS database
---

# Chukfi CMS — Quickstart (v0.2.0)

Get a headless CMS running in 5 minutes.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/quick-start.webm" type="video/webm">
  <source src="/videos/quick-start.mp4" type="video/mp4">
</video>

## Prerequisites

- **Rust** 1.91+ ([rustup](https://rustup.rs))
- **AWS account** with CLI configured — see [AWS Setup](/guides/aws-setup/) for step-by-step instructions
- Your developer IAM user needs `rds:CreateDBInstance`, `rds:DeleteDBInstance`, and `rds:DescribeDBInstances` permissions

## Option A: Run from source (recommended)

```bash
git clone https://github.com/smattera/chukfi-core
cd chukfi-core
```

### 1. Create your database

Each developer gets their own RDS PostgreSQL instance. Run this once — it takes ~10 minutes the first time.

```bash
chukfi db create --name my-chukfi-dev --region us-east-1
```

When it finishes, you'll see a `DATABASE_URL` like:

```
postgres://chukfi:<password>@my-chukfi-dev.abcdef.us-east-1.rds.amazonaws.com:5432/chukfi
```

### 2. Set up config and secrets

```bash
# Copy the standard config template
cp chukfi-bin/templates/standard.config.json chukfi.config.json

# Create .env with the DATABASE_URL from step 1 + a random JWT secret
cat > .env << 'EOF'
DATABASE_URL=postgres://chukfi:<password>@your-instance.region.rds.amazonaws.com:5432/chukfi
CHUKFI_JWT_SECRET=$(openssl rand -hex 32)
CHUKFI_DEV_MODE=true
EOF
```

### 3. Build and start

```bash
cargo build --release -p chukfi-bin
./target/release/chukfi serve
```

Server is live at [http://localhost:4321](http://localhost:4321).

### 4. Seed demo data (optional)

```bash
./target/release/chukfi seed
```

Seeds demo pages and media assets for every content type defined in your config. Navigation groups ship with the schema migrations and are created automatically on first run. Admin users are created lazily by `chukfi token <email>`.

### 5. Get an auth token

Dev mode auto-creates users on first login. To get a JWT without the browser:

```bash
./target/release/chukfi token you@example.com
```

Use it in headers: `Authorization: Bearer <token>`

### 6. Hit the API

```bash
TOKEN=$(./target/release/chukfi token you@example.com)
curl -H "Authorization: Bearer $TOKEN" http://localhost:4321/api/admin/config
```

### 7. Admin UI

The Dioxus-based admin UI builds separately:

```bash
cd chukfi-admin-ui
trunk serve --open    # Opens admin UI at http://localhost:8081 (API runs at http://localhost:4321)
```

## Option B: cargo install (binary only)

```bash
cargo install chukfi-bin
chukfi serve
```

The binary auto-runs migrations on startup (no `sqlx migrate run` needed).
You'll still need the repo for:

- **Admin UI** — not bundled yet; build it from source
- **Config templates** — copy `chukfi.config.json` from the repo

## Customize

Edit `chukfi.config.json` to:

- **Add content types** — blog posts, products, events
- **Change auth** — wire up Entra ID, Cognito, or SES magic links
- **Configure the admin** — name, color, custom components
- **Set S3 media storage** — switch from local filesystem to AWS

Restart the server after changing config.

## Commands reference

| Command | What it does |
|---------|-------------|
| `chukfi db create --name <id>` | Create a per-dev AWS RDS instance |
| `chukfi db list` | List your RDS instances |
| `chukfi db destroy --id <id> --yes` | Destroy an RDS instance |
| `chukfi serve` | Start the API server (default command) |
| `chukfi seed` | Seed demo data (pages, media, users) |
| `chukfi token <email>` | Generate a JWT for local dev |
| `chukfi content create --type pages --title "Hello"` | Create content via CLI |
| `chukfi content list --type pages` | List content entries |
| `chukfi media upload --path ./photo.jpg` | Upload a file |
| `chukfi media list` | List media assets |
| `chukfi codegen` | Generate TypeScript types from schema |

## Tear down your database

When you're done working on a project:

```bash
chukfi db destroy --id my-chukfi-dev --yes
```

This deletes the RDS instance so you're not paying for idle compute.

## Where to go from here

- **Source**: [github.com/smattera/chukfi-core](https://github.com/smattera/chukfi-core)
- **Crate docs**: https://crates.io/crates/chukfi-bin
- **CLI Reference**: [/guides/cli/](/guides/cli/)
- **AWS Setup**: [/guides/aws-setup/](/guides/aws-setup/)
- **Issues / questions**: Open a GitHub issue

## Known gaps (v0.2.0)

- **No `init` command** — `chukfi init` ships in v0.3.0. For v0.2.0, copy `chukfi-bin/templates/standard.config.json` to `chukfi.config.json` manually.
- **Admin UI not bundled in `cargo install`** — build it from source (`cd chukfi-admin-ui && trunk serve`).
- **`cargo install` is binary-only** — migrations are embedded in the binary via `sqlx::migrate!` and run automatically on startup, but config templates and admin UI must come from the source repo.
