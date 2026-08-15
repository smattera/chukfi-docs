---
title: Deployment Overview
description: Deploying Chukfi CMS — EC2 + ALB + RDS + S3 on AWS, per-developer RDS for local dev
---

Chukfi CMS deploys as a single static Rust binary. Production runs on AWS **EC2** (ARM64, systemd, no Docker) with managed **RDS** for the database, **S3** for media, and an **Application Load Balancer** for TLS and path routing.

## Local Development

Each developer creates their own RDS PostgreSQL instance:

```bash
# One-time setup (requires AWS credentials):
#   → https://chukfi.dev/guides/aws-setup/
chukfi db create --name my-chukfi-dev --region us-east-1

# Paste the DATABASE_URL it prints into your .env, then start:
chukfi serve
```

Tear down when done to avoid ~$15/month costs:

```bash
chukfi db destroy --id my-chukfi-dev --yes
```

## Production on AWS

The recommended production stack:

| Resource | Notes |
|----------|-------|
| EC2 (ARM64 Graviton) | Static musl binary under `systemd`. No Docker. |
| RDS PostgreSQL | Private subnet, encrypted at rest, automated backups |
| S3 | Media bucket |
| ALB + ACM | TLS termination, path-based routing to services |
| SES | Email sending (magic-link auth; sandbox mode initially) |

Production RDS is provisioned via IaC — **`chukfi db create` is dev-only** (it creates publicly-accessible, password-only instances and must not be used for production).

### Routing topology (single origin)

The ALB routes by path:

- `/admin`, `/admin/*`, `/api/*`, `/health` → Chukfi CMS (`chukfi serve`, port 4321)
- default `/*` → public frontend (a separate Rust SSR service)

The CMS serves the embedded vanilla-JS dashboard when `adminUiPath` is omitted from config. The public frontend is server-rendered Rust (no Node, no JavaScript framework).

### DNS

`choctawhealthcenter.org` DNS is managed in **Cloudflare**. Proxy mode (DNS-only "grey cloud" vs. proxied "orange cloud") is a deployment-time choice: grey-cloud sends browsers directly to the ALB/ACM origin; orange-cloud terminates TLS at Cloudflare's edge (use **Full (strict)**) with the ALB as origin.

## CI/CD

GitHub Actions builds the Rust binary on every release tag, publishes to crates.io, and uploads release artifacts. See [Production Deployment](/guides/production-deployment/) for the full walkthrough.
