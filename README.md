# Gigma — Local Services Marketplace

Gigma is a React + TypeScript marketplace prototype for finding and posting local service jobs. The frontend includes a map-based location picker, worker/client dashboards, messaging, notifications, and wallet screens.

## Run locally

Requirements: Node.js 20 or newer.

```sh
npm ci
cp .env.example .env
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`, then run:

```sh
npm run dev
```

Checks: `npm run build` and `npm run lint`.

## Supabase setup

Use `supabase_schema.sql` to create the database tables and policies. Supabase Edge Functions are under `supabase/functions/`.

## Payment status

`supabase/functions/mpesa-stk-push/index.ts` is currently placeholder logic: it returns a sample success response and does not call Safaricom. Do not treat wallet or escrow screens as live payment processing.

The map uses Leaflet/OpenStreetMap and reverse geocoding via Nominatim.
