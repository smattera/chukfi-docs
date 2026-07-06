---
title: Deployment Overview
description: Deploying Chukfi CMS — production AWS stack (ECS Fargate + RDS PostgreSQL + S3 + CloudFront)
---

Chukfi CMS deploys entirely to AWS. The `npx chukfi deploy` command provisions the full production stack via the AWS CDK:

| Resource | Config |
|----------|--------|
| RDS PostgreSQL | `db.t4g.micro`, 20 GB, single-AZ |
| ECS Fargate | 0.25 vCPU / 512 MB, 1 task |
| S3 | Media bucket with lifecycle rules |
| SES | Email sending (sandbox mode initially) |
| CloudFront | One distribution with ACM cert |
| VPC | 2 AZs, no NAT Gateway (Free Tier) |

## Cloudflare Pages

While the core CMS (API + Admin UI) runs entirely on AWS, public-facing frontend websites (e.g., the end user's Astro site) can be hosted anywhere.

If you choose Cloudflare Pages for your public frontend, the CLI provides a convenience command to build and deploy it:

```bash
chukfi site deploy --dir ./frontend --project my-public-site
```

The `--project` flag defaults to `chukfi-docs`. The Chukfi project itself uses this command to deploy this documentation site, but end users override the flag with their own Cloudflare Pages project name.

## CI/CD

GitHub Actions builds the Rust binary for all 5 platform targets on every release tag, uploads artifacts to GitHub Releases, and publishes npm packages in lockstep.
