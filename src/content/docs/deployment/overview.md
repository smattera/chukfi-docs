---
title: Deployment Overview
description: Deploying Chukfi CMS — local development with Docker, production on AWS, and frontend deployment to Cloudflare Pages.
---

Chukfi CMS in v0.2.0 supports two deployment paths: local development via Docker Compose, and production deployment to your own AWS infrastructure.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/deploy-tour.webm" type="video/webm">
  <source src="/videos/deploy-tour.mp4" type="video/mp4">
</video>

> **Note:** This video demonstrates planned CDK automation. In v0.2.0, AWS infrastructure must be provisioned manually or via your own IaC tooling.

## Local Development

The repo includes a `docker-compose.yml` for PostgreSQL:

```bash
cat > .env << 'EOF'
POSTGRES_PASSWORD=dev
CHUKFI_JWT_SECRET=$(openssl rand -hex 32)
EOF
docker compose up -d postgres
```

Then start the API:

```bash
cargo build --release -p chukfi-bin
./target/release/chukfi serve
```

## Production on AWS

The recommended production stack includes:

| Resource | Notes |
|----------|-------|
| RDS PostgreSQL | `db.t4g.micro`, 20 GB, single-AZ |
| ECS Fargate | 0.25 vCPU / 512 MB (Free Tier eligible) |
| S3 | Media bucket with lifecycle rules |
| SES | Email sending (sandbox mode initially) |
| CloudFront | CDN with ACM cert |

AWS CDK provisioning for the full stack (ECS Fargate + RDS + CloudFront) is deferred to v0.3.0+. In v0.2.0, provision these resources manually, via the AWS Console, or with your own IaC tooling (CDK, Terraform, Pulumi). Set `DATABASE_URL` to your RDS endpoint and configure S3 via `AWS_ACCESS_KEY_ID` and `S3_BUCKET` environment variables.

## Cloudflare Pages

While the core CMS (API + Admin UI) runs on your infrastructure, public-facing frontends can be deployed to Cloudflare Pages via the built-in CLI command:

```bash
chukfi site deploy --dir ./frontend --project my-public-site
```

The `--project` flag defaults to `chukfi-docs`. The Chukfi project itself uses this command to deploy this documentation site, but end users override the flag with their own Cloudflare Pages project name.

Requires `CLOUDFLARE_API_TOKEN` in the environment.

## CI/CD

GitHub Actions builds the Rust binary on every release tag, publishes to crates.io, and uploads release artifacts.
