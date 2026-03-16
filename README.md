# Imaginative Yarns — Make Me A Story

A magical story co-creation app for children aged 5–8. Kids answer fun questions to build their story's hero, world, and adventure — then watch their personalised tale stream to life in seconds, powered by GPT-4o.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Postgres + Edge Functions)
- **AI**: OpenAI GPT-4o (story streaming) + DALL-E 3 (illustrations)
- **Auth**: Supabase Auth (email/password)

## Local Development

1. Copy `.env.example` to `.env` and fill in your Supabase credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   App runs at [http://localhost:8080](http://localhost:8080).

## Environment Variables

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

## Edge Functions

Both edge functions live in `supabase/functions/` and are deployed to Supabase:

- `generate-story` — streams a GPT-4o story based on the child's choices
- `generate-story-images` — generates hero + setting illustrations via DALL-E 3

The `OPENAI_API_KEY` is stored as a Supabase Edge Function secret (never in the frontend).

## Deployment

Deploy to **Netlify** by connecting the repo. The `netlify.toml` handles build config and SPA redirects automatically.
