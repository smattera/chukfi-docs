---
title: Lessons Learned
description: Lessons learned during Chukfi CMS development — monorepo decisions, architectural pivots, and distribution model changes
---

## 2026-08 — npm Distribution Pivot → Source-First Rust Binary

**Original plan:** Ship the Rust binary via platform-specific packages wrapped by a CLI wrapper, following the esbuild/Prisma/Turbo pattern. Users would run a single CLI command to start a Docker-managed Postgres and the API.

**Why we pivoted:** Multi-platform packaging adds significant release-pipeline complexity for a v0.2.0 binary that already ships on crates.io. The Rust-native audience — developers who already have a Rust toolchain — is underserved by a wrapper-first distribution when `cargo install chukfi-bin` does the job directly.

**Decision:** v0.2.0 ships as `cargo install chukfi-bin` with the full stack available from the source repo. npm distribution and CDK AWS provisioning are deferred to a future release. The binary embeds migrations via `sqlx::migrate!` so `cargo install` users get a working server immediately.

**Rule:** Ship the simplest distribution that works for the current audience. Prefer crates.io for Rust binaries until the npm multi-platform release pipeline is automated and tested.

---

## 2026-06 — Architecture Pivot: Worker → ECS Fargate

**Original plan:** Run the Rust backend as a Cloudflare Worker with D1 (SQLite) for the database.

**Why we pivoted:** The schema uses Postgres-specific features (`tsvector` + GIN for full-text search, `JSONB`, `gen_random_uuid()`) with no drop-in SQLite equivalents in D1. Supporting D1 would have required a multi-week database abstraction layer refactor with permanent regression risk.

**Decision:** Switched to per-developer AWS RDS PostgreSQL for local dev and production. Each developer creates their own `db.t4g.micro` instance via `chukfi db create`. Same engine, same migrations, same SQL. Local-to-prod parity without compromise.

**Rule:** When your schema depends on database-specific features, don't fight it with an abstraction layer. Choose the deployment target that matches your database choices.

---

## 2026-03-22 — Monorepo Over-Engineering

**Mistake:** Scaffolded a monorepo with `packages/types`, `packages/core`, `packages/api`, `packages/worker` — 5 packages for ~100 lines of code that's all private and only used in one place.

**Why it was wrong:** The workspace protocol added complexity without value for an internal-only codebase. Build commands became overly complicated, and the package boundaries didn't map to actual usage patterns.

**Rule:** Don't create shared packages unless code is actually shared across multiple apps or published externally. Private, single-consumer code belongs in the app that uses it.
