---
title: Roadmap
description: Chukfi CMS feature roadmap — upcoming features, priorities, and completed milestones
---

# Chukfi CMS — Feature Roadmap

Features discussed and prioritized for future implementation.

---

## High Priority

### Bun product line
- What else can we implement from Bun? They currently offer their Runtime, Package Manager, Bundler, Test Running... and now Bun Image. (https://bun.com/docs/runtime/image)
- Check to see if these actually fit into our tech stack before implementing. This would be great if it could replace Cloudflare Image Compression.

---

## Medium Priority

### Environment / Config management
- A way to define environment-specific settings (staging vs prod API URLs, feature flags) without hardcoding.
- Fits naturally as a Settings sub-section and pairs well with your draft preview work.

---

## Lower Priority

### Event Registration System (Cvent-like)
Full attendee management for events — dependent on public user authentication and payment processing being established first.
- Public-facing registration flow with customizable per-event fields (built on Form Builder foundation)
- Attendee authentication — public user accounts separate from admin users (requires its own auth system)
- Payment processing integration (Stripe or similar) for paid/ticketed events with fee tiers and promo codes
- Registrations inbox per event: attendee list, check-in status, CSV export
- Automated confirmation and reminder emails via the newsletter plugin's email providers
- Capacity limits and waitlist management

### Approval / Editorial Workflow
A review queue so authors can submit content for editorial sign-off before it goes live.
- New post status: `in_review` (sits between `draft` and `published`)
- Authors can only move records to `in_review`; editors/admins can approve (→ `published`) or reject (→ `draft` with a note)
- In-app notification badge for editors when reviews are pending
- Rejection notes stored in a `review_notes` column

### Analytics Dashboard
Basic traffic and engagement metrics surfaced inside the admin without a third-party dashboard.
- Use Cloudflare Workers Analytics Engine to record page views via a lightweight `GET /api/track?path=...` pixel
- Dashboard page: top content by views (7d/30d), subscriber growth over time, form submission volume
- No PII collected — only path + date + rough geo (country)

### Localization / i18n
Translate collection records into multiple languages while keeping them linked as variants of the same content.
- New `locale` column on supported collections; composite unique key `(slug, locale)`
- Language picker in the record editor to switch between or create locale variants
- API: `GET /api/posts?locale=fr` returns locale-specific records, falls back to default locale
- Locale list configured in Settings (e.g. `en`, `fr`, `de`)

### Navigation Builder
Drag-and-drop tree of links (internal pages or external URLs) outputting a navigation JSON structure for the frontend to consume.
- Stored in the Global Settings singleton or a dedicated `navigation` table
- Frontend: tree editor component with add/remove/reorder/nest

### Nested / Repeatable Fields
Array-type field where each item is a group of sub-fields (e.g. a "sections" array on a page, each section having `heading` + `body` + `image`).
- New field type: `repeatable` with `subfields: CmsField[]`
- Stored as JSON in D1
- Frontend: add/remove/reorder rows in the form

---

## Completed

- [x] Mobile Friendly Admin Dashboard
- [x] Admin Dashboard Homepage
- [x] Tags collection with media tagging and filtering
- [x] Media Library (upload, delete, tag, filter, search)
- [x] Dark mode with system preference detection
- [x] Custom Collections (generic CRUD with schema-driven UI)
- [x] Status workflow (draft / published / scheduled / archived)
- [x] Scheduled publishing (cron auto-publish)
- [x] Content revisions (snapshot on save, restore)
- [x] Trash can (soft delete, 30-day retention, restore, permanent delete)
- [x] Media filename editing
- [x] Command palette (`Cmd+K` / `Ctrl+K`)
- [x] Global Settings singleton
- [x] Webhooks
- [x] Newsletter
- [x] API Key Management
- [x] Import / Export
- [x] Activity Log / Audit Trail
- [x] Image Transformations
- [x] Settings Hub
- [x] Folder Organization for Media
- [x] Email Newsletter Templates
- [x] Multi-User / Role-Based Access Control (RBAC)
- [x] Full-Text Search
- [x] Custom Collections (dynamic schema)
- [x] Public Landing Page
- [x] Form Builder
- [x] Tags Option
- [x] Per-Record SEO Fields
- [x] Media Library Folders Home Button
- [x] Form Field Validation
- [x] Form Submissions Page
- [x] Unified Submissions Routing
- [x] Revised Dashboard
- [x] Bulk Actions
- [x] Content Calendar
- [x] Newsletter Campaigns on Content Calendar
- [x] Events Collection
- [x] Share Posts to Facebook
- [x] Content relationships / References
- [x] Public API / Headless delivery layer
- [x] Redirect Manager
- [x] Page Builder
- [x] Embed / oEmbed Support
- [x] Two-Factor Authentication
