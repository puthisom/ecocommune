# Eco Commune

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/`.

## Shop map

The shop locator uses Leaflet and OpenStreetMap tiles. It does not require an API key.

## Supabase accounts

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/profiles.sql`.
3. Copy the Project URL and publishable/anon key from Supabase API settings.
4. Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

5. Restart `npm run dev`.

Never put a Supabase `service_role` key in the Vite browser app or `.env` files committed to Git.
