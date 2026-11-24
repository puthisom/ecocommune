# Eco Commune

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/`.

## Supabase account sync

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` for local development and in the hosting provider's environment settings for the deployed site. Use the same Supabase project for every deployment.

Run the complete `supabase/profiles.sql` script in the Supabase SQL Editor. It creates the profile fields, private account-data table and row-level security policies, and the profile-photo storage bucket.

When an account first connects, existing browser-local account data is migrated to Supabase if that account has no remote data yet. Profile information, photos, addresses, order history, reward redemptions, favorites, points, carts, and notification preferences then load from and save to Supabase for that account.

## Shop map

The shop locator uses Leaflet and OpenStreetMap tiles. 

