---
title: Quick Start
description: Get started with Chukfi CMS in minutes
---

## Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL)
- An AWS account (for production deployment)

## Installation

```bash
npm install @chukfi/cli
```

## Local Development

Start the local development server:

```bash
npx chukfi dev
```

This will:
1. Detect a Docker runtime (Docker Desktop, Colima, OrbStack, etc.)
2. Spawn an ephemeral `postgres:17-alpine` container on port 5433
3. Run embedded migrations
4. Start the Rust API on port 8080

## Initialize a Project

```bash
npx chukfi init
```

Scaffolds a new Astro project wired to Chukfi with the `@chukfi/astro` integration.

## Deploy to Production

```bash
npx chukfi deploy
```

Provisions the full AWS stack via CDK and writes `.env.production` with all connection values.
