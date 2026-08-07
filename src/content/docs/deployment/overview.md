---
title: Deployment Overview
description: Deploying Chukfi CMS — per-developer AWS RDS
---

Chukfi CMS in v0.2.0 uses per-developer AWS RDS PostgreSQL instances — both for local development and production.

> **Note:** This video demonstrates planned CDK automation. In v0.2.0, AWS infrastructure must be provisioned manually or via your own IaC tooling.

## Local Development

Each developer creates their own RDS PostgreSQL instance:

```bash
# One-time setup (requires AWS credentials):
#   → https://chukfi.dev/guides/aws-setup/
chukfi db create --name my-chukfi-dev --region us-east-1

# Paste the DATABASE_URL it prints into your .env, then start:
cargo build --release -p chukfi-bin
./target/release/chukfi serve
```

Tear down when done to avoid ~$15/month costs:

```bash
chukfi db destroy --id my-chukfi-dev --yes
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
