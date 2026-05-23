# SRS English

A vocabulary builder powered by spaced repetition (SM-2 algorithm). Add words, idioms, and phrasal verbs as flashcards and review them daily — the algorithm schedules each card just before you'd forget it.

## Features

- **Spaced repetition** — SM-2 algorithm adjusts review intervals based on how well you remember each card
- **3 card types** — Words, Idioms, and Phrasal verbs
- **Image support** — attach images to cards as visual memory anchors
- **Daily streak tracking** — keeps your consistency visible
- **Dashboard** — see total cards, cards due today, streak, and breakdown by category
- **Keyboard shortcuts** — Space to flip, 1–4 to rate during study
- **Dark / light theme** — pastel palette with system preference support
- **Auth** — email/password login via Supabase Auth

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions)
- [Supabase](https://supabase.com/) — Postgres database, Auth, Storage
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/srs-english.git
cd srs-english
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run database migrations

Apply the SQL files in `supabase/migrations/` to your Supabase project via the SQL editor or Supabase CLI:

```bash
npx supabase db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

The easiest way to deploy is [Vercel](https://vercel.com):

1. Push the repo to GitHub
2. Import the project on Vercel
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. In your Supabase dashboard → Authentication → URL Configuration, set:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

## How the SM-2 algorithm works

Each card has an **ease factor** (default 2.5). After each review you rate yourself:

| Rating | Key | Effect |
|--------|-----|--------|
| Again  | 1   | Resets interval to day 1, lowers ease factor |
| Hard   | 2   | Short next interval, ease decreases slightly |
| Good   | 3   | Standard interval progression |
| Easy   | 4   | Interval grows faster, ease factor increases |

New interval = `previous interval × ease factor`. A card rated Easy consistently will go from daily → weekly → monthly reviews automatically.

## Project structure

```
app/
├── page.tsx          # Dashboard
├── study/            # Study session
├── cards/            # Card list, create, edit
├── login/            # Auth
└── about/            # How it works

lib/
├── sm2.ts            # SM-2 algorithm
└── supabase/         # Supabase client (browser + server)

supabase/
└── migrations/       # SQL migrations
```
