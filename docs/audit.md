# Step 0: Audit & Architecture Plan

## Executive Summary
This document outlines the codebase audit conducted for **ReplyIQ** prior to implementing the Nigerian tech news and community hub (branded as **"A ReplyIQ Lab project"**) under the `/blog` route namespace on `https://www.replyiq.cv`.

---

## 1. Routing & Architecture
- **Framework & Router**: Next.js 15.5.9 with App Router ([`src/app/`](file:///e:/Files/GitHub%202/ReplyIQ/src/app)) and React 19.2.1.
- **Route Layout**:
  - Landing page: [`src/app/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/page.tsx) (`"use client"`)
  - Blog Index: [`src/app/blog/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/blog/page.tsx) (Server Component, `revalidate = 60`)
  - Blog Detail: [`src/app/blog/[slug]/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/blog/%5Bslug%5D/page.tsx) (Server Component, `revalidate = 60`)
  - Admin Console: [`src/app/admin/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/admin/page.tsx) (Single-page control room with Blog and Newsletter managers)
  - Core Business Flows: `/onboard`, `/partners`, `/login`, `/privacy`, `/terms`, `/widget/[businessId]`, `/c/[businessId]`
- **Server Actions**: Located in [`src/app/actions/`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions) ([`blog.ts`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/blog.ts), [`admin.ts`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/admin.ts), [`onboard.ts`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/onboard.ts), [`partners.ts`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/partners.ts)).

---

## 2. Blog Data Flow & Admin Editor
- **Public Fetching**:
  - [`BlogPage`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/blog/page.tsx) calls [`getBlogPosts(false)`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/blog.ts#L18). Only rows where `status = 'published'` are retrieved, sorted by `published_at DESC`.
  - [`BlogPostPage`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/blog/%5Bslug%5D/page.tsx) calls [`getBlogPostBySlug(slug)`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/blog.ts#L47).
- **Admin Fetching & Authoring**:
  - Admin calls [`getBlogPosts(true)`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/blog.ts#L18), protected by [`checkAdminSession()`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/admin.ts#L45) which inspects the cookie `admin_session === "replyiq_admin_active"`.
  - Creating/updating is handled by [`saveBlogPost(...)`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/blog.ts#L74).
  - On status transition to `published`, an email broadcast is dispatched to `newsletter_subscribers` via Resend.
  - Image assets are uploaded directly from the browser to Supabase Storage bucket `blog-assets` in the `covers/` path using the public client ([`handleImageUpload`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/admin/page.tsx#L873)).

---

## 3. Supabase Client Configurations
Defined in [`src/lib/supabase.ts`](file:///e:/Files/GitHub%202/ReplyIQ/src/lib/supabase.ts):
- **`supabase` (Anon)**: Configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **`supabaseAdmin` (Service Role)**: Configured with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (`persistSession: false`).
- **Current Observation**:
  - `src/app/actions/blog.ts` currently imports and executes queries using the **anon** `supabase` client for both public and admin actions.
  - Because admin authentication is handled via custom cookies and not Supabase Auth, requests made via the anon client arrive at the database with the `anon` role.

---

## 4. Current Metadata & SEO Setup
- **Root Layout ([`src/app/layout.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/layout.tsx))**:
  - `metadataBase` is set to `https://replyiqq.vercel.app` (stale domain).
  - Open Graph & Twitter image URLs reference `https://replyiqq.vercel.app/og-image.png`.
  - `locale` is set to `en_US` (needs `en-NG`).
  - Lacks explicit canonical link configuration.
- **Pages**:
  - [`src/app/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/page.tsx) is `"use client"` and lacks server metadata or structured schema.
  - [`src/app/blog/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/blog/page.tsx) defines basic metadata without canonical or Twitter tags.
  - [`src/app/blog/[slug]/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/blog/%5Bslug%5D/page.tsx) defines `generateMetadata` and JSON-LD `BlogPosting`, but hardcodes `"https://replyiq.com/logo.png"` and `"https://replyiq.com/blog/${post.slug}"`.

---

## 5. Sitemap & Robots Status
- Dynamic Next.js route handlers `app/robots.ts` and `app/sitemap.ts` are **not present**.
- Static files exist in [`public/`](file:///e:/Files/GitHub%202/ReplyIQ/public):
  - [`public/robots.txt`](file:///e:/Files/GitHub%202/ReplyIQ/public/robots.txt)
  - [`public/sitemap.xml`](file:///e:/Files/GitHub%202/ReplyIQ/public/sitemap.xml) (static file with only 6 routes and 2 outdated post URLs from June 2026).
- *Important*: In Next.js, static files in `public/` take precedence over dynamic route handlers `app/robots.ts` and `app/sitemap.ts`. They must be removed when introducing dynamic handlers.

---

## 6. RLS Expectations & Architectural Requirements
- **Current Database State** ([`012_create_blog_posts_table.sql`](file:///e:/Files/GitHub%202/ReplyIQ/supabase/migrations/012_create_blog_posts_table.sql)):
  - Policy: `CREATE POLICY "Allow public read/write access for blog_posts" ON public.blog_posts FOR ALL USING (true);`.
- **Target Database State**:
  - Public (`anon`) role must strictly be limited to:
    ```sql
    CREATE POLICY "Allow public select published posts" ON public.blog_posts
        FOR SELECT TO anon, authenticated
        USING (status = 'published');
    ```
- **Consequence / Requirement**:
  - As soon as this RLS policy is applied, any attempt by the admin console to query drafts, insert posts, update posts, or delete posts using the anon `supabase` client will fail with RLS errors.
  - Therefore, all admin blog server actions (`getBlogPosts(true)`, `saveBlogPost`, `deleteBlogPost`) and the publishing API must execute using `supabaseAdmin` (service role) on the server after session validation.

---

## 7. Stale Domain References Audit
| File | Line(s) | Reference Found | Required Fix |
| :--- | :--- | :--- | :--- |
| [`src/app/layout.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/layout.tsx) | 15, 37, 43, 54 | `https://replyiqq.vercel.app` | Point to `https://www.replyiq.cv` |
| [`src/components/BlogShare.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/components/BlogShare.tsx) | 16 | `https://replyiqq.vercel.app/blog/...` | Use `siteConfig.url` (`https://www.replyiq.cv`) |
| [`src/app/privacy/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/privacy/page.tsx) | 221-222 | `replyiqq.vercel.app` | Update to `www.replyiq.cv` |
| [`src/app/terms/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/terms/page.tsx) | 326-327 | `replyiqq.vercel.app` | Update to `www.replyiq.cv` |
| [`src/app/blog/[slug]/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/blog/%5Bslug%5D/page.tsx) | 88, 94 | `replyiq.com` (in JSON-LD) | Update to `https://www.replyiq.cv` |
| [`next.config.ts`](file:///e:/Files/GitHub%202/ReplyIQ/next.config.ts) | 11-32 | Missing Supabase Storage domain | Add `*.supabase.co` to `images.remotePatterns` |

---

## 8. Summary of Risks & Mitigations
1. **RLS Lockdown Breaking Admin**:
   - *Risk*: Tightening `blog_posts` RLS to `status = 'published'` will block the admin editor from viewing drafts or saving posts.
   - *Mitigation*: Update server actions in `src/app/actions/blog.ts` to use `supabaseAdmin` for authorized admin routines.
2. **Static Public Sitemap Shadowing Dynamic Sitemap**:
   - *Risk*: `public/sitemap.xml` will prevent `app/sitemap.ts` from resolving.
   - *Mitigation*: Delete `public/sitemap.xml` and `public/robots.txt` upon generating dynamic handlers.
3. **Image Optimization Runtime Errors**:
   - *Risk*: Using `next/image` with Supabase Storage URLs will throw an unconfigured host error.
   - *Mitigation*: Configure `remotePatterns` in [`next.config.ts`](file:///e:/Files/GitHub%202/ReplyIQ/next.config.ts).
4. **Preservation of URLs**:
   - Per confirmation, the hub lives under `/blog`. Existing `/blog` links and backlinks are preserved without redirects.

---

## 9. Phased Implementation Plan

### Step 1: Technical SEO Foundations
- Create `src/lib/site-config.ts` with all brand strings (hub name, tagline, URLs, social handles).
- Configure `metadataBase` to `https://www.replyiq.cv`, set canonical URLs, and replace `replyiqq.vercel.app` references.
- Configure permanent domain redirects (apex `replyiq.cv` and `replyiqq.vercel.app` to `https://www.replyiq.cv`) and add `X-Robots-Tag: noindex, nofollow` on Vercel preview environments in [`next.config.ts`](file:///e:/Files/GitHub%202/ReplyIQ/next.config.ts).
- Add dynamic [`src/app/robots.ts`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/robots.ts) and [`src/app/sitemap.ts`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/sitemap.ts); remove static files from `public/`.
- Add JSON-LD (`Organization` & `WebSite` on homepage, `Article` & `BreadcrumbList` on posts, locale `en-NG`).
- Optimize image assets with `next/image` and register Supabase remote patterns.

### Step 2: Information Architecture (under `/blog`)
- Maintain nav and footer consistency with `/blog`.
- Build hub route tree:
  - `/blog`: Main hub (Latest, Featured, Daily Brief highlight, Categories bar, pagination).
  - `/blog/category/[category]`: Filtered category feed (Funding, Startups, Fintech, Web3, Dev Tools, Guides, Daily Brief).
  - `/blog/[slug]`: Post detail.
  - `/blog/brief`: Daily Brief archive.

### Step 3: Database Migration (SQL only)
- Draft migration script:
  - Add `category`, `tags`, `source_urls` (jsonb), `ai_generated`, `seo_title`, `seo_description`, `reading_time`.
  - Status constraint `('draft', 'pending_approval', 'published', 'rejected')`.
  - Composite indexes on `(status, published_at desc)` and unique index on `slug`.
  - Clean RLS policy SQL enforcing public read for `status = 'published'`.

### Step 4: Post and Hub UI
- Article page enhancements: reading time, sources outbound links (`rel="noopener noreferrer"`), related posts, breadcrumbs, "A ReplyIQ Lab project" badge.
- Share buttons: WhatsApp (first), X, LinkedIn, copy link with UTM parameters.
- End-of-article CTAs: Telegram community link and Daily Brief newsletter form with honeypot and rate limiting.
- Dynamic post OG image generator via `next/og` (`ImageResponse`).
- RSS feed at `/blog/rss.xml` (or `/feed.xml`).

### Step 5: Secured Publishing API
- `POST /api/blog/posts` (or `/api/community/posts`): constant-time `x-agent-key` comparison, Zod validation, idempotent slug upsert via `supabaseAdmin`.
- `PATCH /api/blog/posts/[id]/status`: post moderation status updater.
- Cache revalidation via `revalidatePath` and `revalidateTag`.

### Step 6: Admin Dashboard Updates
- Extend blog editor modal in [`src/app/admin/page.tsx`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/admin/page.tsx) with the new fields (category, tags, sources, SEO title/description).
- Switch admin server actions in [`src/app/actions/blog.ts`](file:///e:/Files/GitHub%202/ReplyIQ/src/app/actions/blog.ts) to `supabaseAdmin`.
- Add "Agent Drafts" queue with preview, edit, approve, reject controls, and agent pause switch.

### Step 7: Documentation (`docs/community.md`)
- Complete reference documentation covering architecture, routes, environment variables, API integration guide, and deployment checklist.
