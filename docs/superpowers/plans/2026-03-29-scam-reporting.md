# Scam Reporting System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance scam reporting and lookup system with WebP image uploads and an integrated banner ad system.

**Architecture:** 
- Database & Search: Supabase (PostgreSQL) with `pg_trgm` materialized views for ms-level text search.
- Storage: Cloudflare R2 / S3 with client-side WebP compression and direct pre-signed URL uploads.
- Frontend: Next.js App Router using React Server Components, Suspense, and ISR for optimal SEO and caching.

**Tech Stack:** Next.js (App Router), Supabase (PostgreSQL), Tailwind CSS, `browser-image-compression`, `aws-sdk/client-s3`.

---

## Chunk 1: Database Setup & Infrastructure

### Task 1: Supabase Database Migration for Scam Data

**Files:**
- Create: `supabase/migrations/20260329000000_scam_reporting_schema.sql`

- [ ] **Step 1: Write the migration script**

```sql
-- Create Enum for Report Status
CREATE TYPE scam_report_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE scam_report_type AS ENUM ('tôi bị scam', 'đăng hộ');

-- Create ScamReports Table
CREATE TABLE public.scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scammer_name TEXT NOT NULL,
  total_scam_amount DECIMAL(15, 2) NOT NULL,
  description TEXT NOT NULL,
  type scam_report_type NOT NULL,
  original_post_url TEXT,
  reporter_contact_name TEXT NOT NULL,
  reporter_contact_zalo TEXT NOT NULL,
  status scam_report_status DEFAULT 'pending',
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Related Tables
CREATE TABLE public.scam_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  url TEXT NOT NULL
);

CREATE TABLE public.scam_socials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  platform_name TEXT,
  platform_url TEXT,
  username TEXT,
  user_url TEXT
);

CREATE TABLE public.scam_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL
);

CREATE TABLE public.scam_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.scam_reports(id) ON DELETE CASCADE,
  website_name TEXT,
  url TEXT,
  domain TEXT
);

CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  position TEXT NOT NULL, -- e.g., 'header', 'sidebar'
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ
);
```

- [ ] **Step 2: Run migration to verify**
Run: `npx supabase db push` or apply via Supabase Dashboard.

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations
git commit -m "feat(db): create scam reporting schema"
```

### Task 2: Search Index View

**Files:**
- Create: `supabase/migrations/20260329000001_scam_search_index.sql`

- [ ] **Step 1: Write the migration script**

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE MATERIALIZED VIEW public.scam_search_index AS
SELECT 
    r.id AS report_id,
    r.scammer_name,
    r.status,
    COALESCE(string_agg(DISTINCT b.account_number, ' '), '') AS bank_accounts,
    COALESCE(string_agg(DISTINCT w.domain, ' '), '') AS domains,
    COALESCE(string_agg(DISTINCT s.username, ' '), '') AS usernames,
    (r.scammer_name || ' ' || 
     COALESCE(string_agg(DISTINCT b.account_number, ' '), '') || ' ' || 
     COALESCE(string_agg(DISTINCT w.domain, ' '), '') || ' ' ||
     COALESCE(string_agg(DISTINCT s.username, ' '), '')) AS search_vector
FROM public.scam_reports r
LEFT JOIN public.scam_banks b ON r.id = b.report_id
LEFT JOIN public.scam_websites w ON r.id = w.report_id
LEFT JOIN public.scam_socials s ON r.id = s.report_id
GROUP BY r.id;

CREATE INDEX idx_scam_search_trgm ON public.scam_search_index USING GIN (search_vector gin_trgm_ops);

-- Function to refresh the view
CREATE OR REPLACE FUNCTION refresh_scam_search_index()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.scam_search_index;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update view on status change
CREATE TRIGGER trigger_refresh_scam_search
AFTER UPDATE OF status ON public.scam_reports
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_scam_search_index();
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations
git commit -m "feat(db): add trigram search index for scam lookup"
```

---

## Chunk 2: API & Storage

### Task 3: S3/R2 Pre-signed URL API

**Files:**
- Create: `app/api/upload/presigned/route.ts`

- [ ] **Step 1: Install AWS S3 client**
Run: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

- [ ] **Step 2: Implement minimal route**

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { filename, contentType } = await req.json();
    const key = `scams/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return NextResponse.json({ url, key });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate pre-signed URL' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add package.json package-lock.json app/api/upload/presigned/route.ts
git commit -m "feat(api): add r2 presigned url generator"
```

### Task 4: Client-side Image Compression Hook

**Files:**
- Create: `hooks/useImageUpload.ts`

- [ ] **Step 1: Install browser compression lib**
Run: `npm install browser-image-compression`

- [ ] **Step 2: Write custom hook**

```typescript
import { useState } from 'react';
import imageCompression from 'browser-image-compression';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp'
        });

        // Get Presigned URL
        const res = await fetch('/api/upload/presigned', {
          method: 'POST',
          body: JSON.stringify({
            filename: compressedFile.name.replace(/\.[^/.]+$/, "") + ".webp",
            contentType: 'image/webp'
          })
        });
        const { url, key } = await res.json();

        // Upload to R2
        await fetch(url, {
          method: 'PUT',
          body: compressedFile,
          headers: { 'Content-Type': 'image/webp' }
        });

        uploadedUrls.push(`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setIsUploading(false);
    return uploadedUrls;
  };

  return { uploadImages, isUploading };
}
```

- [ ] **Step 3: Commit**
```bash
git add package.json package-lock.json hooks/useImageUpload.ts
git commit -m "feat(hooks): add client side webp compression and r2 upload"
```

---

## Chunk 3: Frontend Views

### Task 5: Report Form UI (`/to-cao-scam`)

**Files:**
- Create: `app/to-cao-scam/page.tsx`

- [ ] **Step 1: Write component with basic form handling**
Use React Hook Form + Zod for validation.
Connect the `useImageUpload` hook to handle images.
Insert the payload into `ScamReports`, `ScamBanks`, `ScamSocials`, and `ScamMedia` via a Supabase Server Action.

- [ ] **Step 2: Commit**
```bash
git add app/to-cao-scam
git commit -m "feat(ui): add scam report submission page"
```

### Task 6: Search & Home UI (`/check-uy-tin`)

**Files:**
- Create: `app/check-uy-tin/page.tsx`
- Create: `app/actions/scam-search.ts`

- [ ] **Step 1: Write Server Action for fast text search**
```typescript
'use server'
import { createClient } from '@/utils/supabase/server';

export async function searchScams(query: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('scam_search_index')
    .select('report_id, scammer_name, search_vector')
    .eq('status', 'approved')
    .ilike('search_vector', `%${query}%`)
    .limit(10);
  
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create UI**
Create an input box. On change, trigger `searchScams` (with debounce).
Show banners horizontally across the layout.

- [ ] **Step 3: Commit**
```bash
git add app/check-uy-tin app/actions/scam-search.ts
git commit -m "feat(ui): build high speed search page and banner integration"
```

### Task 7: Details Page ISR (`/scamer/[slug]`)

**Files:**
- Create: `app/scamer/[slug]/page.tsx`

- [ ] **Step 1: Create statically generated details page**
```typescript
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const revalidate = 60; // or ISR hook based on Admin approval

export default async function ScammerDetails({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: report } = await supabase
    .from('scam_reports')
    .select('*, scam_banks(*), scam_media(*)')
    .eq('slug', params.slug)
    .eq('status', 'approved')
    .single();

  if (!report) notFound();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{report.scammer_name}</h1>
      {/* Render Banks, Media, Details, Banners */}
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add app/scamer
git commit -m "feat(ui): add scammer detail page with ISR cache"
```
