# Frontend (standalone)

This is the Next.js storefront/admin frontend. It can run without the backend, but API-backed pages (products, auth, cart, etc.) will show empty/error states until a backend is available.

## Run

```powershell
npm install
npm run dev
```

Open http://localhost:3000

## Environment

Edit `.env.local`:

- `NEXT_PUBLIC_API_URL` – backend API base, e.g. `http://localhost:8000/api/v1`
- `NEXT_PUBLIC_SITE_URL` – public site origin for metadata/sitemap
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` – optional
- `NEXT_PUBLIC_FAKE_DATA` – set `true` to use built-in sample catalog data (products/categories/brands/vehicles) when no backend is running

If the backend is not running, keep `NEXT_PUBLIC_API_URL` pointed at the expected backend; requests use short timeouts and fail gracefully. With `NEXT_PUBLIC_FAKE_DATA=true`, catalog pages render sample data locally.
