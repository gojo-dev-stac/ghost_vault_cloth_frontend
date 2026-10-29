# GHOST Frontend

The website for GHOST. It talks to the Django API in `../backend`.

## Stack

- React 19 with TanStack Start (routing and SPA prerender shell)
- TanStack Query for data fetching
- Tailwind CSS 4
- Vite 8

## Quick start

Start the backend first (see `../backend/README.md`). Then:

```bash
npm install
cp .env.example .env
npm run dev
```

The site runs at http://localhost:8080.

For local development, a production server build:

```bash
npm run build
npm start      # runs on http://localhost:3000
```
Note: The intro video plays best on the production build because it
uses the MP4 format. On npm run dev, some browsers may not play the WebM
version.

## Plesk static deployment

The Plesk release is a static SPA, served from the domain's `httpdocs`; it does
not need Docker or Node.js on the Plesk server. The build prerenders a TanStack
SPA shell and Apache rewrites client routes to that shell. API requests run in
the browser and use the production URL in `.env.plesk`.

From PowerShell in this project directory, run:

```powershell
npm ci
npm run build:plesk
```

This creates a timestamped `vault-frontend-plesk-*.zip` containing the contents
of the static site at its root, including `.htaccess`, videos, brand assets,
campaign frames and product images. Upload the ZIP to the domain's `httpdocs`
in Plesk and extract it with **Replace existing files** enabled. Do not upload
the project source, `node_modules`, `.output`, or `.env`.

For the full procedure and verification checklist, see
[PLESK_STATIC_DEPLOY_GUIDE.md](PLESK_STATIC_DEPLOY_GUIDE.md).

## Environment variable

There is only one public build variable. Use `frontend/.env` for local
development and `.env.plesk` for the Plesk production build:

| Name           | Default                       | What it does             |
| -------------- | ----------------------------- | ------------------------ |
| `VITE_API_URL` | `http://localhost:8000/api`   | Where the backend lives  |

## Login credentials

| Role          | Email                      | Password      |
| ------------- | -------------------------- | ------------- |
| Owner / Admin | `hasshamahmed73@gmail.com` | `12Admin45/?` |
| Member        | `hasshamahmed13@gmail.com` | `12Hassham01`   |

On a new database, sign up with these first. The member needs the owner's
approval before they can shop.

## Pages

| Page              | Who can see it      | What it shows                          |
| ----------------- | ------------------- | -------------------------------------- |
| `/`               | Everyone            | The vault intro video                  |
| `/auth`           | Everyone            | Login, request access, forgot password |
| `/collection`     | Everyone            | The public gallery                     |
| `/product/:id`    | Everyone            | Product details and reviews            |
| `/contact`        | Everyone            | Contact form                           |
| `/reset-password` | Everyone            | Set a new password from the email link |
| `/vault`          | Approved members    | The members-only store                 |
| `/me`             | Approved members    | My Vault: your orders and their status |
| `/checkout`       | Approved members    | Delivery details and payment           |
| `/admin`          | Admins              | Members, stock, orders, support, reviews |

## Project structure

```
frontend/
  public/          logo, videos and product images
  server/          static file handler for the production server
  src/
    routes/        one file per page (URL and page title)
    pages/         the page components
    admin/         admin dashboard tabs
    components/    shared UI (header, product cards, forms)
    hooks/         useAuth, useCart, useProducts, useOrders
    lib/           API calls (api.ts, auth.ts, products.ts, orders.ts ...)
    styles/        colors, fonts and animations
```

## Access rules

- Pending members can log in, but they only see the PENDING screen.
- Rejected members can't log in. They see the REJECTED screen.
- If someone is rejected while logged in, they get logged out on their next click.
- Only approved members can open The Vault, My Vault and checkout.
- Only admins can open the Admin Dashboard.
