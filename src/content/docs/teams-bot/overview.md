---
title: Teams Bot Overview
description: Architecture and capabilities of the Chukfi CMS Teams Bot — AI-powered content management via Microsoft Teams and Amazon Bedrock.
---

The Chukfi Teams Bot connects Microsoft Teams to the Chukfi CMS through Amazon Bedrock (Claude 3.5 Haiku). Staff can create, list, and update website content directly from Teams conversations without touching the admin interface.

<video controls autoplay loop muted playsinline style="width: 100%; border-radius: 0.75rem; border: 1px solid var(--sl-color-gray-5); margin: 1.5rem 0;">
  <source src="/videos/teams-bot-tour.webm" type="video/webm">
  <source src="/videos/teams-bot-tour.mp4" type="video/mp4">
</video>

## Architecture

```
[Staff] ──(Teams @mention)──> [chukfi-teams-bot]
                                       │
                                  FastAPI Server
                                       │
                            ┌──────────┴──────────┐
                            │  HMAC Verification   │  ← Teams webhook origin
                            │  Entra Tenant Check  │  ← Only authorized tenants
                            └──────────┬──────────┘
                                       │
                            ┌──────────┴──────────┐
                            │  Amazon Bedrock      │
                            │  Claude 3.5 Haiku    │
                            │  (Converse API)      │
                            └──────────┬──────────┘
                                       │
                            ┌──────────┴──────────┐
                            │  Guarded Executor    │  ← Python-enforced safety
                            │  (subprocess)        │
                            └──────────┬──────────┘
                                       │
                            ┌──────────┴──────────┐
                            │  chukfi CLI --json   │
                            └──────────┬──────────┘
                                       │
                            ┌──────────┴──────────┐
                            │  PostgreSQL          │
                            │  (Chukfi CMS DB)     │
                            └─────────────────────┘
```

## Capabilities

| Action | Description | Draft Only? |
|--------|-------------|-------------|
| **Create entries** | Blog posts, alerts, events, pages, services, staff profiles, carousel slides, job openings, directory entries | ✅ Always |
| **List entries** | Query by content type, status (draft/published), with pagination | N/A |
| **Update entries** | Edit fields on existing entries | ✅ Always |
| **Upload media** | Add images and documents to the media library | N/A |
| **Codegen** | Generate TypeScript types from the content schema | N/A |

## Security Architecture

The Teams Bot uses a **four-layer security model** — each layer is independent and enforced in Python code, never in the LLM prompt. This prevents prompt injection from bypassing any control.

### Layer 1: HMAC Signature Verification

Every Teams Outgoing Webhook request includes an `Authorization: HMAC <signature>` header. The bot verifies this using the shared webhook secret:

```python
# main.py — HMAC verification
key = base64.b64decode(settings.teams_webhook_secret)
hashed = hmac.new(key, body, hashlib.sha256).digest()
expected_sig = base64.b64encode(hashed).decode("utf-8")
return hmac.compare_digest(received_sig, expected_sig)
```

This ensures only Microsoft Teams can send requests to the bot endpoint.

### Layer 2: Entra Tenant ID Validation

The bot checks the tenant ID sent cryptographically by Teams in `channelData.tenant.id`. Only tenants in the hardcoded allowlist can interact:

```python
# config.py — Tenant whitelist
ALLOWED_TENANTS: ClassVar[set[str]] = {
    "ncs-tenant-uuid-here",  # Replace with actual NCS UUID
    "your-tenant-uuid-here",  # Replace with your actual Entra Tenant UUID
}
```

### Layer 3: Content Type Whitelist

The bot only operates on approved content types. Any request for an unapproved type is rejected at the executor layer:

```python
# config.py — Content type whitelist
ALLOWED_CONTENT_TYPES: ClassVar[set[str]] = {
    "blog-posts", "alerts", "events", "pages",
    "services", "staff", "carousel-slides",
    "job-openings", "directory-entries",
}
```

### Layer 4: Draft-Only Enforcement

Every create and update operation is forced to `--status draft`. The bot **cannot publish content directly** — a human must review and publish via the admin UI:

```python
# executor.py — Hardcoded draft status
args = [
    "content", "create",
    "--type", type_slug,
    "--title", title,
    "--fields", fields_json,
    "--status", "draft",  # HARDCODED — cannot be overridden
    "--json",
]
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Web Framework** | FastAPI (Python 3.11) |
| **AI Model** | Claude 3.5 Haiku via Amazon Bedrock Converse API |
| **CLI Backend** | `chukfi` Rust binary (subprocess) |
| **Database** | PostgreSQL (shared with Chukfi CMS) |
| **Auth** | HMAC-SHA256 + Microsoft Entra ID |
| **Deployment** | Docker container (ECS Fargate or any cloud VM) |
