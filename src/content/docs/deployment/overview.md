---
title: Deployment Overview
description: Deploying Chukfi CMS — local development with Docker and production on AWS
---

Chukfi CMS in v0.2.0 supports two deployment paths: local development via Docker Compose, and production deployment to your own AWS infrastructure.

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

## CI/CD

GitHub Actions builds the Rust binary on every release tag, publishes to crates.io, and uploads release artifacts.
