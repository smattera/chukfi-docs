---
title: Security &amp; RBAC
description: Passwordless magic links, multi-factor authentication, and enterprise role-based access control.
---

Chukfi CMS is built with production-grade security from day one. It supports passwordless authentication and granular role-based access control (RBAC).

> **Note:** This video demonstrates a planned npm distribution. v0.2.0 ships as a Rust binary — see the [Quick Start](/guides/quick-start/) for current setup.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/security-tour.webm" type="video/webm">
  <source src="/videos/security-tour.mp4" type="video/mp4">
</video>

## Passwordless Magic Links

No passwords to leak, hash, or manage. Users enter their email address, and Chukfi sends a secure, short-lived cryptographic magic link to their inbox. During local development (`CHUKFI_DEV_MODE=true`), users are auto-created on first login.

## Role-Based Access Control (RBAC)

Chukfi uses a colon-delimited permission model (`resource:action`) to enforce granular access. Built-in roles include:

- **Administrator** — Full access to schemas, content, media, and settings.
- **Publisher** — Can create, edit, and publish content. Cannot modify schemas.
- **Editor** — Can create and edit drafts. Cannot publish or delete content.

## Enterprise SSO: Microsoft Entra ID

For enterprise teams, Chukfi integrates natively with Microsoft Entra ID (formerly Azure AD) via OpenID Connect (OIDC). Map Entra ID groups directly to Chukfi roles to automate user provisioning. Configure via the `auth.providers` section in `chukfi.config.json`.
