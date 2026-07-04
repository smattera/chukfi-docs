---
title: Architecture
description: Chukfi CMS architecture overview
---

# Chukfi — Phase 3 Architecture

**Status:** Draft for review
**Audience:** Platform maintainers, future contributors, solo developers evaluating Chukfi

## 1. Vision

Chukfi is a headless CMS purpose-built for Astro, distributed as a single `npx chukfi` command. Three non-negotiable pillars:

- **CLI-first distribution** — The Rust binary ships as platform-specific npm packages, wrapped by `@chukfi/cli`. No Rust toolchain, no build steps, no operating knowledge required.
- **Local-to-prod parity** — Local dev runs Docker-managed PostgreSQL; production runs AWS RDS PostgreSQL. Same engine, same migrations, same SQL.
- **AWS-only deploy** — One command provisions the full stack on AWS via CDK. One domain, one bill, no hybrid hosting.

**Target user:** Solo developers shipping Astro sites who want CMS-grade content management without operating infrastructure.

## 2. CLI-First Distribution

The Rust binary does not ship as a `cargo install` artifact or a Docker image. It ships as **platform-specific npm packages** using the same pattern as esbuild, Prisma, and Turbo:

```
@chukfi/cli                         ← thin Node wrapper (~50 lines)
  └─ optionalDependencies:
       ├─ @chukfi/core-linux-x64
       ├─ @chukfi/core-linux-arm64
       ├─ @chukfi/core-darwin-x64
       ├─ @chukfi/core-darwin-arm64
       └─ @chukfi/core-windows-x64
```

`npm install @chukfi/cli` pulls the correct binary for the host OS automatically. The wrapper spawns it as a child process and verifies checksums against the GitHub release the npm packages were published from.

### Commands

| Command | Purpose |
|---------|---------|
| `npx chukfi dev` | Start local API on :8080 (Docker Postgres + binary + migrations) |
| `npx chukfi init` | Scaffold a new Astro project wired to Chukfi |
| `npx chukfi deploy` | Provision AWS stack via CDK, extract endpoints, write `.env.production` |
| `npx chukfi upgrade` | Pull latest binary, re-run migrations, restart |

### Release pipeline

GitHub Actions builds the binary for all 5 platform targets on every release tag, uploads artifacts to GitHub Releases, and publishes the npm packages in lockstep. Manual override: `--bin-url` flag for testing pre-release builds.

## 3. Local Development — Path A (Docker-managed PostgreSQL)

**Decision:** Local dev uses Docker-managed PostgreSQL. SQLite dual-mode is declined for v1.

### Why not SQLite

The current schema uses Postgres-specific features with no drop-in SQLite equivalent:

- `tsvector` + GIN index for full-text search — SQLite FTS5 is a different engine with different semantics
- `JSONB` for `data`, `draft_data`, `seo`, `schema`, `diff` — SQLite requires `TEXT` + `json1` parsing at every read
- Raw `sqlx::query("... WHERE id = $1 ...")` — `sqlx` does not rewrite parameter markers at runtime
- `gen_random_uuid()` defaults — would have to be generated in Rust application code

Supporting SQLite would require a multi-week database access layer refactor with permanent regression risk. Docker Postgres is universal in the target audience.

### What `npx chukfi dev` does

1. Detect a Docker runtime (Docker Desktop, Colima, OrbStack, Rancher Desktop)
2. If `DATABASE_URL` is unset, spawn an ephemeral `postgres:17-alpine` container named `chukfi-dev` on port 5433
3. Run embedded migrations from the binary
4. Spawn the Rust API on port 8080
5. Stream logs to the terminal until Ctrl+C
6. Tear down the container on exit (unless `--persist` is set)

`DATABASE_URL` is the only switch between local and production database configuration. Pointing it at an external Postgres (shared dev database, staging RDS) is the override path.

## 4. Astro Integration (`@chukfi/astro`)

A thin wrapper over the CLI. One job: provide a one-command dev experience.

### What it does

- `astro:server:setup` hook spawns the CLI's `dev` process when `astro dev` starts
- Astro middleware proxies `/api/*` and `/admin/*` requests to the local API on port 8080
- The pre-compiled admin UI in `chukfi-cms/admin-ui/` is served from the API at `/admin/*` — the Astro site inherits it transparently

### What it does NOT do

- It does not embed the Rust binary
- It does not implement proxy logic itself
- It does not manage Docker

The integration is ~50 lines of glue. If it breaks, the CLI works standalone and the dev can keep moving.

## 5. AWS Deployment (`npx chukfi deploy`)

The CLI scaffolds a TypeScript CDK application in the project's `/deploy` directory and deploys it with one command. No hybrid hosting — frontend, backend, and database all live in the same AWS account, behind one CloudFront distribution.

### Stack

| Resource | Config | Free Tier? |
|----------|--------|------------|
| RDS PostgreSQL | `db.t4g.micro`, 20 GB, single-AZ | ✓ 12 months |
| ECS Fargate | 0.25 vCPU / 512 MB, 1 task, auto-scale 1-2 | ✓ 400 GB-hr/mo |
| S3 | Media bucket, lifecycle rules | ✓ 5 GB |
| SES | Sandbox mode (production access on request) | ✓ 3,000 emails/mo |
| CloudFront | One distribution, ACM cert, /api + /admin + /* routing | ✓ 1 TB egress/yr |
| VPC | 2 AZs, Fargate in public subnets (public IPs, SG-restricted), RDS in private subnets | ✓ (No NAT) |
| Secrets Manager | DB credentials, JWT secret | Minimal |

**Cost:** Effectively **$0/month** for hobby tier (under Free Tier limits). **$10-15/month** for low-traffic production after Free Tier expires (no NAT Gateway).

### One-command workflow

```bash
npx chukfi deploy
   ↓
Detects AWS credentials (env, profile, SSO)
   ↓
cd deploy && npm install
   ↓
npx cdk bootstrap   (one-time per AWS account/region)
   ↓
npx cdk deploy
   ↓
Outputs:
  - CloudFront URL (https://d1234.cloudfront.net)
  - RDS endpoint
  - S3 bucket name
  ↓
Writes .env.production with all values
```

No AWS Console clicking. No manual security group rules. Custom domain setup (pointing a domain at the CloudFront distribution) is documented in the generated `/deploy/README.md`.

## 6. Architectural Notes

**SSR is the default.** The CloudFront → ECS architecture assumes server-side rendered Astro (like `chc-cms`, which uses `@astrojs/node`). Dynamic content is fetched at request time from the Rust API.

**SSG is supported but requires a public API URL.** Solo developers using static builds (`astro build` with the default static output) will fetch content at build time. The API must be reachable during the build pipeline. For local SSG builds, this means the CLI's `dev` command must be running. For production SSG builds on CI, this requires either deploying the API first and using a `PUBLIC_CHUKFI_API_URL` env var, or running `chukfi dev` as a build-step sidecar. Full SSG workflow is documented in the generated `/deploy/README.md`.

**Path A (Docker Postgres) is the locked local-dev choice.** This decision was driven by the AWS-only deploy constraint: Docker local Postgres = RDS production Postgres = 100% engine parity. SQLite was considered and declined because the schema uses Postgres-specific features (`tsvector` + GIN for full-text search, `JSONB`, raw `$1` parameter markers, `gen_random_uuid()` defaults) with no drop-in SQLite equivalents.

## 7. Phase 3 Roadmap

| # | Deliverable | Time | v1? |
|---|-------------|------|-----|
| 1 | `@chukfi/cli` `dev` command (Docker detection, Postgres spawn, migrations, binary) | 2 days | ✓ |
| 2 | Binary release pipeline (GitHub Actions → 5 platform builds → npm publish) | 2 days | ✓ |
| 3 | `@chukfi/cli` `deploy` command (CDK scaffold, deployment orchestration, .env extraction) | 2-3 days | ✓ |
| 4 | `@chukfi/astro` integration (spawn binary, proxy /api + /admin) | 1 day | ✓ |
| 5 | `create-chukfi-app` scaffold (interactive project init) | 1-2 days | v1.1 |

**v1 shippable scope:** Items 1-4. Total: 7-8 days focused.

**Deferred to v2:** SQLite dual-mode (only if real demand for no-Docker local dev emerges), multi-region deployment, custom domain automation beyond CloudFront default cert.
