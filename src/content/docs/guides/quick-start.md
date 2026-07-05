---
title: Quick Start
description: Get started with Chukfi CMS in minutes — install, local dev, and deploy
---

## Prerequisites

- Node.js 24+
- Docker (for local PostgreSQL)
- An AWS account (for production deployment)

## Installation

<video src="/videos/quick-start.mp4" controls autoplay loop muted style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;" />

If the video doesn't load, here's what you'll see:

1. **Chukfi CMS logo** with the tagline "Ship a CMS in 30 Seconds"
2. **Terminal demo** showing the two commands to get started
3. **"Your CMS is Live"** confirmation screen

Install the CLI:

```bash
npm install @chukfi/cli
```

Start the local development server:

```bash
npx chukfi dev
```

This will:
1. Detect a Docker runtime (Docker Desktop, Colima, OrbStack, etc.)
2. Spawn an ephemeral `postgres:17-alpine` container on port 5433
3. Run embedded migrations
4. Start the Rust API on port 8080

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

Provisions the full AWS stack via CDK and writes `.env.production` with all connection values.
