---
title: Deployment Overview
description: Deploying Chukfi CMS — AWS production stack and Cloudflare Pages docs
---

Chukfi CMS supports two deployment targets: **AWS** for production and **Cloudflare** for the docs site.

## AWS Deployment (Production)

The `npx chukfi deploy` command provisions the full AWS stack via CDK:

| Resource | Config |
|----------|--------|
| RDS PostgreSQL | `db.t4g.micro`, 20 GB, single-AZ |
| ECS Fargate | 0.25 vCPU / 512 MB, 1 task |
| S3 | Media bucket with lifecycle rules |
| SES | Email sending (sandbox mode initially) |
| CloudFront | One distribution with ACM cert |
| VPC | 2 AZs, no NAT Gateway (Free Tier) |

## Cloudflare Pages (Docs)

The documentation site is deployed to Cloudflare Pages:

```bash
npx wrangler pages deploy dist --project-name=chukfi-docs
```

## CI/CD

GitHub Actions builds the Rust binary for all 5 platform targets on every release tag, uploads artifacts to GitHub Releases, and publishes npm packages in lockstep.
