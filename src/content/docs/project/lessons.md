---
title: Lessons Learned
description: Lessons learned during Chukfi CMS development — monorepo decisions and architectural pivots
---

## 2026-03-22 — Monorepo Over-Engineering

**Mistake:** Scaffolded a monorepo with `packages/types`, `packages/core`, `packages/api`, `packages/worker` — 5 packages for ~100 lines of code that's all private and only used in one place.

**Why it was wrong:** The workspace protocol added complexity without value for an internal-only codebase. Build commands became overly complicated, and the package boundaries didn't map to actual usage patterns.

**Rule:** Don't create shared packages unless code is actually shared across multiple apps or published externally. Private, single-consumer code belongs in the app that uses it.

---

## 2026-06 — Architecture Pivot: Worker → ECS Fargate

**Original plan:** Run the Rust backend as a Cloudflare Worker with D1 (SQLite) for the database.

**Why we pivoted:** The schema uses Postgres-specific features (`tsvector` + GIN for full-text search, `JSONB`, `gen_random_uuid()`) with no drop-in SQLite equivalents in D1. Supporting D1 would have required a multi-week database abstraction layer refactor with permanent regression risk.

**Decision:** Switched to Docker PostgreSQL for local dev and AWS RDS PostgreSQL + ECS Fargate for production. Same engine, same migrations, same SQL. Local-to-prod parity without compromise.

**Rule:** When your schema depends on database-specific features, don't fight it with an abstraction layer. Choose the deployment target that matches your database choices.
