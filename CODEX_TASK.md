# Task: Add Google Auth + Gallery to ScreenSnap

## Context
ScreenSnap is a screenshot sharing tool at `/home/ubuntu/clawd/projects/screensnap/`.
It's a Next.js 15 app with App Router, Tailwind, next-themes (dark/light mode).
Supabase is already configured in `.env.local`.

## What to build

### 1. Supabase Client (`src/lib/supabase.ts`)
- Browser client using `@supabase/ssr` createBrowserClient
- Server client for server components

### 2. Auth Callback Route (`src/app/auth/callback/route.ts`)
- Handle the OAuth callback from Supabase/Google
- Exchange code for session
- Redirect to `/gallery`

### 3. Auth Context (`src/context/AuthContext.tsx`)
- React context providing `user`, `loading`, `signInWithGoogle()`, `signOut()`
- Use `@supabase/ssr` browser client
- Listen to auth state changes
- Auto-create profile in `profiles` table on first login

### 4. Update Navbar (`src/components/Navbar.tsx`)
Current navbar has: logo + dark/light toggle.
Add:
- If logged out: "Sign in" button (calls signInWithGoogle)
- If logged in: user avatar (from Google) + dropdown with "Gallery" link and "Sign out"
- Keep the dark/light toggle
- Keep it clean and minimal

### 5. Gallery Page (`src/app/gallery/page.tsx`)
- Protected route (redirect to home if not logged in)
- Grid of user's screenshots from `screenshots` table
- Each card shows: thumbnail, title/filename, dimensions, date, view count
- Click to open the share page
- Delete button on each card
- Empty state: "No screenshots yet. Start by sharing one!"
- Metallic Liquid Glass design system (use existing CSS variables)

### 6. Update Upload Flow
Currently uploads go nowhere (no backend). Update:
- If user is logged in: save to Supabase Storage + create `screenshots` row
- If user is NOT logged in: still allow upload but show a prompt to sign in to save to gallery
- Generate short_id for shareable links
- Store in Supabase Storage bucket called `screenshots`

### 7. Share Page (`src/app/s/[id]/page.tsx`)
- Public page showing a single screenshot
- Fetch from `screenshots` table by short_id
- Show image, title, dimensions, uploaded by, date
- Copy link button
- Increment view count

## Database Tables (already created)
```sql
screenshots: id, user_id, short_id, original_name, file_url, thumbnail_url, 
             file_size, width, height, mime_type, is_public, title, description, 
             views, created_at, updated_at

profiles: id, display_name, avatar_url, username, bio, created_at, updated_at
```

## Environment Variables (already in .env.local)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY

## Design Rules
- Use existing CSS variables (var(--background), var(--accent), etc.)
- Use `liquid-glass-card` class for cards
- Dark/light mode must work (next-themes)
- NEVER use purple
- Accent color is sky blue (#0EA5E9)
- Keep it minimal and clean

## Important
- Do NOT modify the hero section or the screenshot selection animation
- Do NOT modify globals.css animation keyframes
- Wrap the app in AuthProvider in layout.tsx
- Use nanoid for short_id generation (already available or install)
