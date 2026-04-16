# Dad's Store

A personal e-commerce site for selling auction finds directly — no eBay fees, no middleman.

Buyers browse listings, add items to a cart, and check out via Stripe or PayPal. The seller manages everything from a private admin dashboard: add photos and listing details, toggle items as sold, view and update orders.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| Auth | NextAuth.js (credentials) |
| Card Payments | Stripe |
| PayPal Payments | PayPal Orders API v2 |
| Hosting | Vercel |

---

## Prerequisites

- Node.js 18+
- [Supabase account](https://supabase.com) (free tier)
- [Stripe account](https://stripe.com) (test mode to start)
- [PayPal Developer account](https://developer.paypal.com) (sandbox to start)
- [Vercel account](https://vercel.com) (free tier)

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/jdamon31/dads-website.git
cd dads-website
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in every value. See [Environment Variables](#environment-variables) below for where to find each one.

### 3. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Storage** → **New Bucket**:
   - Name: `product-images`
   - Public bucket: **ON**
   - File size limit: `10MB`
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

### 4. Run the dev server

```bash
npm run dev
```

Site runs at [http://localhost:3000](http://localhost:3000).
Admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

### 5. Set up Stripe webhook (local)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli), then:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret it prints and set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## Admin Access

Navigate to `/admin/login`. Enter the password you set as `ADMIN_PASSWORD` in your environment variables.

The session lasts 24 hours. There is no registration — it's a single-user admin panel.

---

## Environment Variables

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI output (local) or Stripe Dashboard → Webhooks (production) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal Developer → My Apps → App credentials |
| `PAYPAL_CLIENT_ID` | Same as above |
| `PAYPAL_CLIENT_SECRET` | PayPal Developer → My Apps → App credentials |
| `PAYPAL_MODE` | `sandbox` for dev, `live` for production |
| `NEXTAUTH_URL` | `http://localhost:3000` (dev) or your production URL |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Choose a strong password |
| `ADMIN_EMAIL` | Your email address |

---

## Deployment (Vercel)

### 1. Push to GitHub

The repo is already linked at https://github.com/jdamon31/dads-website.

### 2. Import in Vercel

Go to [vercel.com](https://vercel.com), click **Add New Project**, and import the `dads-website` repo.

### 3. Add environment variables

In Vercel → Project → Settings → Environment Variables, add every variable from `.env.local.example` with production values:

- Switch `PAYPAL_MODE` from `sandbox` to `live`
- Set `NEXTAUTH_URL` to your production domain (e.g. `https://dads-website.vercel.app`)
- Use live Stripe keys instead of test keys

### 4. Register the Stripe production webhook

In Stripe Dashboard → Webhooks → Add Endpoint:
- URL: `https://your-domain.vercel.app/api/stripe/webhook`
- Events to listen for: `payment_intent.succeeded`

Copy the signing secret and set it as `STRIPE_WEBHOOK_SECRET` in Vercel env vars.

### 5. Deploy

Vercel deploys automatically on every push to `main`.

---

## Folder Structure

```
app/
  (store)/         # Public storefront (homepage, product pages, checkout)
  (admin)/         # Protected admin dashboard
  api/             # Route handlers (products, orders, Stripe, PayPal, upload)
components/
  ui/              # Shared UI primitives (Button, Badge, Input, Select, Spinner)
  store/           # Storefront components (ProductCard, CartDrawer, etc.)
  admin/           # Admin components (ListingForm, ImageUploader, etc.)
hooks/
  useCart.ts       # Zustand cart store (persisted to localStorage)
lib/
  supabase.ts      # Browser Supabase client
  supabase-server.ts # Server-only Supabase client + admin client
  auth.ts          # NextAuth config
  stripe.ts        # Stripe SDK instance
  paypal.ts        # PayPal REST API helpers
types/
  index.ts         # All shared TypeScript types
supabase/
  schema.sql       # Full database schema — run this in Supabase SQL Editor
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `products` | Listings — title, price (cents), condition, category, status, fulfillment |
| `product_images` | One-to-many photos per product with display order |
| `orders` | Completed purchases — buyer info, fulfillment, payment details |
| `order_items` | Line items per order; inserting a row automatically marks the product as sold |

All prices are stored as **integer cents** (e.g. $45.00 = `4500`) to avoid floating-point bugs.

---

## Adding a Listing

1. Go to `/admin/login` and sign in
2. Click **Listings** → **+ New Listing**
3. Fill in title, price, condition, category, and description
4. Upload photos (use ← → arrows to reorder — first photo is the main image)
5. Set fulfillment: Ship, Local Pickup, or Both
6. Set status to **Active** when ready to sell publicly
7. Click **Create Listing**

The listing appears on the storefront immediately. When sold, it's automatically marked as Sold and the buyer's order appears in the admin Orders tab.
