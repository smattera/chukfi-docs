---
title: Quick Start
description: Get started with Chukfi CMS in minutes — install, local dev, and deploy
---

## Prerequisites

- Node.js 24+
- PostgreSQL — via Docker, a local PostgreSQL service (Homebrew, Postgres.app), or AWS Secrets Manager
- An AWS account (for production deployment)

## Installation

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/quick-start.webm" type="video/webm">
  <source src="/videos/quick-start.mp4" type="video/mp4">
</video>

Start the local development server:

```bash
npx chukfi dev
```

Chukfi handles PostgreSQL setup automatically:
1. **With Docker:** If Docker is running, the CLI spawns an ephemeral `postgres:17-alpine` container on port 5433, runs migrations, and starts the API.
2. **Without Docker (interactive prompt):** If Docker is absent, the CLI walks you through connecting to a local PostgreSQL instance, or pulling development credentials from AWS Secrets Manager. It validates the connection and saves it to `.env` so subsequent runs skip the prompt.
3. Starts the Rust API on port 8080.

Your CMS is now running at **http://localhost:8080**.

## Initialize a Project

```bash
npx chukfi init
```

Scaffolds a new Astro project wired to Chukfi with the `@chukfi/astro` integration.

## Deploy to Production

```bash
npx chukfi deploy
```

A single command to ship to production:
1. Provisions your AWS infrastructure (RDS PostgreSQL + compute) via CDK.
2. Fetches the generated database credentials from AWS Secrets Manager.
3. Writes `DATABASE_URL` to `.env.production` for your CI/CD pipeline.

Requires: AWS CLI configured (`aws configure`) and CDK installed globally (`npm install -g aws-cdk`).
