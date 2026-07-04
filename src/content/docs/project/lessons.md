---
title: Lessons Learned
description: Lessons learned during Chukfi CMS development
---

## 2026-03-22 — Monorepo Over-Engineering

**Mistake:** Scaffolded a monorepo with `packages/types`, `packages/core`, `packages/api`, `packages/worker` — 5 packages for ~100 lines of code that's all private and only used in one place.

**Why it was wrong:** `workspace:*` protocol caused Cloudflare Pages to fail with npm, required complex build command workarounds, and added zero value for an internal-only codebase.

**Rule:** Don't create shared packages unless code is actually shared across multiple apps or published externally. Private, single-consumer code belongs in the app that uses it.

---

## 2026-03-22 — Cloudflare Pages Bun Detection

**Mistake:** Assumed setting `BUN_VERSION` env var would make Pages use bun for the install step. It installs bun but still runs `npm install`.

**Why it was wrong:** Pages detects the package manager from the lockfile (`bun.lockb` binary or `bun.lock` JSON) in the *root directory* it's pointed at. If root is a subdirectory without the lockfile, it falls back to npm.

**Rule:** For bun monorepos on Cloudflare Pages, keep root directory as `/` (repo root) where `bun.lock` lives. Scope the build command instead: `bun install && cd apps/admin && bun run build`.

---

## 2026-03-22 — wrangler.toml Scope

**Mistake:** Put the Worker `wrangler.toml` at the repo root when Pages was also reading from the root, causing a "not valid for Pages" warning.

**Rule:** Each Cloudflare app (Worker, Pages) should own its `wrangler.toml` inside its own directory (`apps/worker/wrangler.toml`, `apps/admin/wrangler.toml`).
