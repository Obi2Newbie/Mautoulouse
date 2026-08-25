# Mautoulouse 🌴

La plateforme communautaire des Mauriciens de Toulouse.

## Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database / Storage**: Supabase

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in your Supabase credentials
cp .env.local.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
  page.tsx                  → Home / Landing
  login/page.tsx            → Login
  signup/page.tsx           → Sign Up
  forum/page.tsx            → Q&A Forum list
  forum/ask/page.tsx        → Ask a question
  forum/[id]/page.tsx       → Question thread detail
  events/page.tsx           → Events dashboard
  events/[id]/page.tsx      → Event detail
  profile/page.tsx          → User profile + settings + danger zone
  admin/
    page.tsx                → Analytics dashboard
    events/page.tsx         → Manage events
    events/new/page.tsx     → Create / edit event
    users/page.tsx          → User management
    photos/page.tsx         → Photo albums + lightbox
    faqs/page.tsx           → FAQ management

components/
  ui/                       → Button, Badge, Avatar, Input, Card
  layout/                   → Navbar, AdminSidebar
  events/                   → EventCard
  forum/                    → QuestionRow

lib/
  types.ts                  → TypeScript interfaces
  mockData.ts               → Mock data (replace with Supabase calls)
  utils.ts                  → Helpers (cn, timeAgo, etc.)
```

## Design Tokens

| Token   | Value     |
|---------|-----------|
| Navy    | `#1B3D5F` |
| Coral   | `#E05C3A` |
| Gold    | `#F4A323` |
| Teal    | `#09A572` |
| Sand bg | `#F8F5F0` |

Fonts: **Fraunces** (display) + **Outfit** (body) via `next/font/google`

## Connecting to FastAPI

Replace the mock data in `lib/mockData.ts` with API calls to your FastAPI backend.
Example:

```ts
// lib/api.ts
export async function getEvents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`)
  return res.json()
}
```

## Connecting to Supabase

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```
