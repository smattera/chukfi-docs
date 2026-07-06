---
title: Overview
description: An overview of the Chukfi CMS platform — a headless CMS built with Rust, Astro, and AWS
---

Chukfi is a headless CMS — a content management system that provides a content API and admin interface without dictating how your frontend renders content.

## Three Non-Negotiable Pillars

### CLI-First Distribution

The Rust binary ships as platform-specific npm packages (`@chukfi/core-linux-x64`, `@chukfi/core-darwin-arm64`, etc.), wrapped by `@chukfi/cli`. Installing `@chukfi/cli` pulls the correct binary for your OS automatically.

```bash
npx chukfi dev     # Start local API on :8080
npx chukfi init    # Scaffold a new Astro project
npx chukfi deploy  # Provision AWS stack via CDK
npx chukfi upgrade # Pull latest binary, re-run migrations
```

### Local-to-Prod Parity

Local development uses Docker-managed PostgreSQL; production uses AWS RDS PostgreSQL. Same engine, same migrations, same SQL. No SQLite dual-mode — the schema uses Postgres-specific features (`tsvector`, `JSONB`, `gen_random_uuid()`) that have no drop-in SQLite equivalents.

### AWS-Only Deploy

One command provisions the full stack on AWS via CDK. One domain, one bill, no hybrid hosting. The stack includes RDS, ECS Fargate, S3, CloudFront, and SES — all within Free Tier limits for hobby projects.

## Target Audience

Solo developers shipping Astro sites who want CMS-grade content management without operating infrastructure.
