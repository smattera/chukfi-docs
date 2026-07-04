---
title: Backend Overview
description: Chukfi CMS backend architecture — REST API, auth, content engine, and media storage
---

The Chukfi CMS backend is written in Rust and compiled to a native binary. It provides a RESTful API for content management, authentication, media handling, and more.

## Core Components

- **REST API** — Axum-based HTTP server handling all CRUD operations
- **Content Engine** — Schema-driven content types with flexible JSON field storage
- **Auth System** — Magic link (passwordless email) and Microsoft Entra ID (OIDC) authentication
- **Media Storage** — S3 (production) or local filesystem (development)
- **Session Management** — JWT-based sessions with configurable expiry
- **RBAC** — Role-based access control with granular permissions

## Key Technologies

| Component | Technology |
|-----------|-----------|
| Web Framework | Axum |
| Database | PostgreSQL via sqlx |
| Auth | Magic Link + Entra ID OIDC |
| Media | S3 / Local filesystem |
| Templates | Tera |
| Email | SES (production) / stdout (development) |

## Domain Glossary

- **Content Type** — A schema definition for a kind of content (Pages, Blog Posts, Events, etc.)
- **Entry** — A single instance of a Content Type
- **Draft** — An unpublished version of an Entry (two-slot model)
- **Status** — Lifecycle state: `draft`, `published`, or `archived`
- **Locale** — Language/region variant for an Entry
- **Version** — Point-in-time snapshot of an Entry's data
- **User** — A person authenticated by an Auth Provider
- **Role** — A named set of Permissions
- **Permission** — A colon-delimited string `{resource}:{action}`
- **Tenant** — A logical isolation boundary for multi-tenancy
