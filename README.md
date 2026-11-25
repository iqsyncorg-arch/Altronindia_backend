# altronindiabackend

Express + MongoDB API for [Altronindia](https://github.com/) (catalog, products, admin, catalogue PDF uploads).

## Setup

```bash
cp .env.example .env
# Edit MONGODB_URI, JWT_SECRET, CORS_ORIGIN
npm install
npm run dev
```

API: `http://localhost:3001`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with reload |
| `npm start` | Production start |
| `npm run seed` | Categories from `src/data/productCategories.ts` |
| `npm run seed-products` | Import products from altronindia.com WooCommerce |
| `npm run sync-catalogues` | Download product PDFs into `uploads/catalogues/` |

## Front-end

Point the Vite app at this API:

- Dev: Vite proxy `/api` → `http://localhost:3001` (default in Altronindia `vite.config.ts`)
- Or set `VITE_API_URL=http://localhost:3001/api` and `VITE_CATALOG_SOURCE=mongodb`

## Routes

- `GET /api/catalog/*` — category tree
- `GET /api/products` — public product list
- `POST /api/admin/login` — admin JWT
- `/api/admin/*` — categories, products, WooCommerce sync, PDF upload
- `GET /api/uploads/catalogues/:file` — local catalogue PDFs

## First admin

`POST /api/admin/users/bootstrap` with `{ "email", "password" }` when no users exist (then protect the route in production).