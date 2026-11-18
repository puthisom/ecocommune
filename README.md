# Eco Commune

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/`.

## Configure Google Maps

Create `.env.local` in the project root:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

In Google Cloud Console:

1. Enable **Maps JavaScript API**.
2. Create or select an API key.
3. For local development, allow `http://localhost:3000/*` as a website restriction.
4. Restart `npm run dev` after creating or changing `.env.local`.

Do not commit real API keys. `.env.local` is ignored by Git.
