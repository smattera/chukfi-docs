---
title: Production Deployment
description: Deploying Chukfi CMS to production on AWS — EC2 + ALB + RDS + S3, Cloudflare DNS, no Docker
---

# Production Deployment

This guide walks through the intended production topology for Chukfi CMS. It reflects the architecture decided in the ADRs (EC2 + ALB + RDS + S3, no Docker) and used for the Choctaw Health Center (CHC) deployment.

> **Status:** The topology below is **decided**; the Terraform/IaC module and automated deployment are **planned**. Instance sizes, AMI IDs, and exact RDS/S3 specifications are determined during provisioning and are not pinned here.

## Topology

```
                     Cloudflare DNS (choctawhealthcenter.org)
                                │
                                ▼
                     ALB (internet-facing, ACM TLS)
                     ├─ /admin, /admin/*, /api/*, /health ─► Chukfi CMS (EC2, ARM64, systemd, :8080)
                     └─ /* (default) ──────────────────────► Rust SSR frontend (separate service)
                                │
                                ├─ RDS PostgreSQL (private subnet)
                                └─ S3 (media)
```

## Components

| Layer | Choice | Notes |
|-------|--------|-------|
| DNS | Cloudflare | `www` canonical; apex handled via redirect or proxy as configured |
| TLS | ALB + ACM | ALB is internet-facing; EC2 sits in a private subnet |
| Compute | ARM64 EC2 (Graviton) | Static musl binary under `systemd`; no Docker |
| CMS | `chukfi serve` | Embedded dashboard served when `adminUiPath` is omitted |
| Frontend | Separate Rust SSR service | Server-rendered HTML, no Node, no JS framework; vanilla JS acceptable for progressive enhancement |
| Database | RDS PostgreSQL | Private subnet, encrypted at rest, automated backups |
| Media | S3 | Set `S3_BUCKET` explicitly |
| Secrets | SSM Parameter Store + instance role | `DATABASE_URL`, JWT secret, email/SES config |

## Important: `chukfi db create` is dev-only

`chukfi db create` provisions a publicly-accessible, password-only RDS instance for **local development**. Do **not** use it for production. Production RDS is provisioned via IaC with private networking and managed credentials.

## S3 activation gotcha

The binary's S3 activation check is an **OR across environment variables** (`AWS_ACCESS_KEY_ID`, `AWS_PROFILE`, `AWS_ACCESS_KEY`, `S3_BUCKET`) — it reads env vars, not instance-role (IMDS) credentials. An EC2 instance role alone will **not** activate S3 media storage. Set `S3_BUCKET` explicitly in the environment.

## Cloudflare proxy mode

`choctawhealthcenter.org` DNS is managed in Cloudflare. Two modes:

- **DNS-only ("grey cloud")** — browsers hit the ALB directly; ACM serves the certificate. This is the simplest match for the ALB+ACM design.
- **Proxied ("orange cloud")** — Cloudflare terminates TLS at its edge. If proxied, use **Full (strict)** so Cloudflare validates the origin against the ACM certificate.

Proxy mode is a deployment-time choice; the ALB+ACM design works with either.

## Routing details

The CMS dashboard is a catch-all fallback inside the binary (`app.fallback`). This is correct *because* the ALB only routes `/admin*`, `/api/*`, and `/health` to the CMS — so the fallback only ever serves the dashboard HTML. The dashboard's absolute `/api/...` calls route back through the same ALB rules to the CMS.

The public frontend must not receive CMS admin/API paths, and vice-versa. Two separate systemd services (CMS + SSR frontend), not one binary.

Note on local vs. production paths: `chukfi serve` locally serves the dashboard as a catch-all at `/`. Production mounts the same dashboard under `/admin` purely via the ALB path rules above — the binary itself is unchanged and does not mount `/admin` on its own.

## Private-subnet networking

The EC2 instance sits in a private subnet, so it needs egress to reach AWS services:

- **SSM Parameter Store / SES** — via a NAT gateway or the corresponding VPC endpoints (`ssm`, `ec2messages`, `ssmmessages`, `ses`).
- **S3** — via a NAT gateway or an S3 gateway endpoint.

This is provisioned as part of the Terraform IaC (Stage 3d); it is not automatic.

## Cloudflare ACM validation

ACM certificate validation requires DNS CNAME records. Because DNS is managed in Cloudflare, create the ACM-issued validation CNAMEs in Cloudflare. If Cloudflare proxying (orange cloud) is used, the validation records must remain **DNS-only (grey cloud)** so ACM can resolve them.

## Deployment sequence (planned)

1. Provision VPC, private EC2, RDS, S3, ALB, ACM, IAM, SSM via Terraform.
2. Build the ARM64 musl binary in CI (native ARM runner or cross-compile).
3. Install `chukfi` + `chukfi.service` (and `chukfi-frontend.service`) on EC2.
4. Inject secrets from SSM; set `S3_BUCKET`; omit `adminUiPath`.
5. Point Cloudflare DNS at the ALB, verify TLS, promote.

## Related

- [Deployment Overview](/deployment/overview/)
- [Architecture](/architecture/architecture/)
- [Public Read API](/api/public-read-api/)
