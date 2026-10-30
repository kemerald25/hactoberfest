# ReplyIQ Tech Hub & Community Documentation

> **Brand**: A ReplyIQ Lab project  
> **Canonical Domain**: `https://www.replyiq.cv`  
> **Route Namespace**: `/blog`  
> **Telegram Community**: `https://t.me/+tIue_nAcN3NmNzFk` (configurable via `NEXT_PUBLIC_TELEGRAM_URL`)

---

## 1. Hub Architecture & Routes

The ReplyIQ Tech Hub is built as an organic traffic and community acquisition engine for ReplyIQ's core WhatsApp AI customer support product. It is branded respectfully as **"A ReplyIQ Lab project"**, maintaining clean separation from ReplyIQ's commercial pricing, onboarding, and business dashboard.

### Route Map

| Route | Type | Description |
|---|---|---|
| `/blog` | Server Page | Tech Hub homepage. Features the **Daily Brief** hero strip, category filters, paginated articles, community Telegram CTA, and newsletter form. |
| `/blog/brief` | Server Page | Dedicated archive of daily morning Nigerian tech digests (`Daily Brief`). |
| `/blog/category/[category]` | Server Page | Category archive feed with custom SEO title, description, and canonical link. |
| `/blog/[slug]` | Server Page | Article view with reading time, BreadcrumbList structured data, Article JSON-LD, source attributions, social share buttons (WhatsApp, X, LinkedIn, Copy), related posts, and ReplyIQ product callout. |
| `/blog/[slug]/opengraph-image` | Dynamic OG | Edge-rendered 1200x630 dynamic OpenGraph social share card via `@vercel/og` (`next/og`). |
| `/feed.xml` & `/blog/rss.xml` | XML Route | Fully compliant RSS 2.0 feed with category and author tags for feed readers. |
| `/sitemap.xml` | Dynamic XML | Dynamic sitemap indexing all published articles, category pages, static marketing pages, and legal pages. |
| `/robots.txt` | Dynamic Route | Serves automated crawl instructions, points to `https://www.replyiq.cv/sitemap.xml`, and blocks `/admin` and `/api/`. |
| `/admin` (Tab: "Agent Drafts") | Dashboard | Dedicated moderation queue for reviewing, editing, approving, or rejecting automated agent drafts, with an Ingestion Pause toggle. |

### Categories

1. **Daily Brief** (`/blog/category/daily-brief`) - Morning digests summarizing top headlines across the Nigerian tech ecosystem.
2. **AI & Tech** (`/blog/category/ai-and-tech`) - Applied AI, software engineering, and digital tools for Nigerian business.
3. **Funding & Startups** (`/blog/category/funding-and-startups`) - Venture rounds, accelerator cohorts, acquisitions, and founders.
4. **SME & Retail** (`/blog/category/sme-and-retail`) - Commerce, retail tech, WhatsApp business automation, and trade.
5. **Policy & Telco** (`/blog/category/policy-and-telco`) - CBN regulations, NITDA, telecom tariffs, tariffs, and data privacy.

---

## 2. External Agent Ingestion API

Automated content curation workflows (e.g., built in **n8n**, **Make**, or custom Python/TypeScript scripts) publish directly to ReplyIQ through secured webhook endpoints.

### Endpoints

- Primary: `POST https://www.replyiq.cv/api/blog/posts`
- Alias: `POST https://www.replyiq.cv/api/community/posts`

### Authentication

Requests must include a shared secret key configured in the `AGENT_PUBLISH_KEY` environment variable. The endpoint verifies authentication in constant time (`crypto.timingSafeEqual`) to prevent timing attacks.

Authenticate using either:
```http
Authorization: Bearer YOUR_AGENT_PUBLISH_KEY
```
or
```http
x-agent-key: YOUR_AGENT_PUBLISH_KEY
```

### Ingestion Pause Control

If the admin has toggled **"Pause Agent Ingestion"** in `/admin` (under the Agent Drafts tab), all incoming requests to `POST /api/blog/posts` will immediately return:
```json
{
  "success": false,
  "error": "Agent ingestion is currently paused by admin.",
  "code": "INGESTION_PAUSED"
}
```
HTTP Status: `403 Forbidden`.

### Rate Limiting

The endpoint allows up to **60 requests per minute per IP address**. Requests exceeding this threshold receive HTTP `429 Too Many Requests`.

### Request Payload Schema

```json
{
  "title": "CBN Launches New Guidelines for Open Banking API Integrations",
  "slug": "cbn-launches-new-guidelines-open-banking-2026",
  "content": "## Overview\n\nThe Central Bank of Nigeria has unveiled an updated regulatory framework...\n\n### Key Takeaways\n- Standardized customer consent flows\n- Encryption requirements for third-party payment providers\n\n[Read source analysis on BusinessDay](https://businessday.ng/example)",
  "excerpt": "Nigeria's central bank introduces updated API security and consent frameworks for fintechs and commercial banks.",
  "cover_image": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
  "category": "Policy & Telco",
  "tags": ["cbn", "open banking", "fintech", "regulations"],
  "source_urls": [
    {
      "title": "BusinessDay Nigeria",
      "url": "https://businessday.ng/technology/article/cbn-open-banking",
      "publisher": "BusinessDay"
    },
    {
      "title": "TechCabal",
      "url": "https://techcabal.com/2026/04/cbn-guidelines",
      "publisher": "TechCabal"
    }
  ],
  "status": "pending_approval",
  "ai_generated": true,
  "seo_title": "CBN Open Banking API Regulations 2026 | ReplyIQ Tech Hub",
  "seo_description": "Breakdown of the Central Bank of Nigeria's updated Open Banking guidelines for tech startups.",
  "author_name": "ReplyIQ Lab",
  "author_avatar": "/favicon.jpg"
}
```

#### Field Specifications

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | `string` | **Yes** | — | Headline of the post (5–200 characters). |
| `slug` | `string` | No | Auto from title | URL-friendly slug. If matching an existing slug, the record is idempotently updated. |
| `content` | `string` | **Yes** | — | Markdown or HTML body content. |
| `excerpt` | `string` | No | Auto from content | Short preview summary (max 300 characters). |
| `cover_image` | `string` | No | `null` | Absolute HTTPS URL to cover image. |
| `category` | `string` | No | `'AI & Tech'` | One of: `'Daily Brief'`, `'AI & Tech'`, `'Funding & Startups'`, `'SME & Retail'`, `'Policy & Telco'`. |
| `tags` | `string[]` | No | `[]` | Array of keyword tags. |
| `source_urls` | `object[]` | No | `[]` | Array of source attributions (`[{ title, url, publisher }]`). |
| `status` | `string` | No | `'pending_approval'` | `'pending_approval'`, `'draft'`, or `'published'`. |
| `ai_generated` | `boolean` | No | `true` | Flags post as AI-synthesized in metadata. |
| `seo_title` | `string` | No | Auto from title | Meta title tag override (max 70 chars). |
| `seo_description`| `string` | No | Auto from excerpt | Meta description tag override (max 160 chars). |
| `author_name` | `string` | No | `'ReplyIQ Lab'` | Display author name. |
| `author_avatar` | `string` | No | `'/favicon.jpg'` | Author avatar URL. |

### Sample cURL Command

```bash
curl -X POST "https://www.replyiq.cv/api/blog/posts" \
  -H "Authorization: Bearer YOUR_AGENT_PUBLISH_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Flutterwave Expands Agent Banking Network with Offline SMS Fallback",
    "slug": "flutterwave-expands-agent-banking-offline-sms",
    "category": "Funding & Startups",
    "tags": ["flutterwave", "fintech", "agency banking"],
    "excerpt": "African payments giant Flutterwave has introduced SMS-based transaction verifications for rural POS merchants facing cellular data blackouts.",
    "content": "African payments unicorn **Flutterwave** has rolled out an offline fallback layer for its merchant network...\n\n### Impact on Nigerian SMEs\nMerchants in remote clusters can now confirm incoming settlements without active 4G data coverage.",
    "source_urls": [
      {
        "title": "TechCabal",
        "url": "https://techcabal.com/flutterwave-offline-pos",
        "publisher": "TechCabal"
      }
    ],
    "status": "pending_approval",
    "ai_generated": true
  }'
```

### Successful Response (HTTP 201 Created)

```json
{
  "success": true,
  "message": "Article ingested successfully into pending approval queue.",
  "data": {
    "id": "e4a77df3-6df5-4fae-9ef7-2dc7a77e9974",
    "title": "Flutterwave Expands Agent Banking Network with Offline SMS Fallback",
    "slug": "flutterwave-expands-agent-banking-offline-sms",
    "category": "Funding & Startups",
    "status": "pending_approval",
    "reading_time": 2,
    "ai_generated": true,
    "created_at": "2026-10-18T05:00:00.000Z",
    "url": "https://www.replyiq.cv/blog/flutterwave-expands-agent-banking-offline-sms"
  }
}
```

---

## 3. Status Modification API

Admin or external supervisory agents can programmatically update an article's status.

### Endpoint

- Primary: `PATCH https://www.replyiq.cv/api/blog/posts/[id]/status`
- Alias: `PATCH https://www.replyiq.cv/api/community/posts/[id]/status`

### Request

```http
PATCH /api/blog/posts/e4a77df3-6df5-4fae-9ef7-2dc7a77e9974/status
Authorization: Bearer YOUR_AGENT_PUBLISH_KEY
Content-Type: application/json

{
  "status": "published"
}
```

Valid values for `status`: `'draft'`, `'pending_approval'`, `'published'`, `'rejected'`.

---

## 4. Environment Variables Checklist

Ensure the following variables are configured in `.env.local` for local development and in **Vercel Project Settings > Environment Variables**:

| Variable | Scope | Required | Description | Example |
|---|---|---|---|---|
| `AGENT_PUBLISH_KEY` | Server | **Yes** | Shared secret token for authenticating n8n/Make webhook agents. | `sk_live_agent_984f...` |
| `NEXT_PUBLIC_SITE_URL` | Public | **Yes** | Canonical site URL. Strictly use `https://www.replyiq.cv`. | `https://www.replyiq.cv` |
| `NEXT_PUBLIC_TELEGRAM_URL` | Public | **Yes** | Invite link for the ReplyIQ Telegram community. | `https://t.me/+tIue_nAcN3NmNzFk` |
| `SUPABASE_SERVICE_ROLE_KEY`| Server | **Yes** | Supabase service-role key. Used by server actions and API routes to bypass RLS for admin workflows. | `eyJhbGciOi...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | **Yes** | Supabase project URL. | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | **Yes** | Supabase anonymous public key. | `eyJhbGciOi...` |
| `RESEND_API_KEY` | Server | Optional | Resend API key for broadcasting newsletters when new posts are published. | `re_...` |

> [!CAUTION]
> **Security Notice**: Never expose `SUPABASE_SERVICE_ROLE_KEY` or `AGENT_PUBLISH_KEY` in `NEXT_PUBLIC_*` client variables or commit them to source control.

---

## 5. Manual User Execution Checklist

The following actions must be executed manually:

### 1. Execute SQL Migration in Supabase
Open the **Supabase Dashboard > SQL Editor** and run the contents of:
[`supabase/migrations/019_community_hub_and_rls.sql`](file:///e:/Files/GitHub%202/ReplyIQ/supabase/migrations/019_community_hub_and_rls.sql)

This script:
- Adds missing columns (`category`, `tags`, `source_urls`, `ai_generated`, `seo_title`, `seo_description`, `reading_time`) to `public.blog_posts`.
- Updates the status constraint to `('draft', 'pending_approval', 'published', 'rejected')`.
- Creates performance indexes on `category`, `status`, `published_at`, and `tags`.
- Configures Row Level Security (RLS) on `public.blog_posts` so anonymous users can **ONLY** view posts where `status = 'published'`.
- Creates the `public.app_settings` table for storing admin settings (such as the ingestion pause state).

### 2. Set Up Environment Variables
- Generate a strong random key (e.g. `openssl rand -hex 32`) and save it as `AGENT_PUBLISH_KEY`.
- Set `NEXT_PUBLIC_SITE_URL=https://www.replyiq.cv`.
- Set `NEXT_PUBLIC_TELEGRAM_URL=https://t.me/+tIue_nAcN3NmNzFk` (or your preferred Telegram channel link).
- Add these variables to your Vercel deployment.

### 3. Submit Sitemap to Google Search Console
- Open **Google Search Console** for `https://www.replyiq.cv`.
- Under **Sitemaps**, submit:
  ```text
  https://www.replyiq.cv/sitemap.xml
  ```
- Googlebot will automatically discover all hub pages, category archives, and individual article URLs.

### 4. Verify Canonical & Apex Redirects
- Open a browser and verify that `http://replyiq.cv` and `https://replyiq.cv` permanently 301 redirect to `https://www.replyiq.cv/`.
- Verify that `https://replyiqq.vercel.app/` permanently redirects to `https://www.replyiq.cv/`.
- Ensure DNS A and CNAME records at your registrar match Vercel's apex and `www` configuration.

---

## 6. Admin Dashboard Workflow

1. Visit `https://www.replyiq.cv/admin` and log in with your administrative credentials.
2. Click on the **"Agent Drafts"** tab in the sidebar (marked with a Sparkles icon).
3. Under the **Automated Agent Drafts** queue:
   - Review ingested articles with their headline, slug, category, sources, and ingestion timestamp.
   - Click **"Edit / Preview"** to adjust title, excerpt, Markdown body, category, tags, or source attributions.
   - Click **"Approve"** (green button) to immediately change the status to `published`, make it live on `/blog`, and trigger the dynamic sitemap revalidation.
   - Click **"Reject"** (red button) to archive non-relevant drafts.
4. If you need to halt incoming automated ingestions temporarily, click **"Pause Agent Ingestion"**. The banner will switch to `Ingestion Paused (403)` and reject any webhook submissions until resumed.
